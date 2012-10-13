class IdTableNameController < ApplicationController
  def associate_guids
    @sourceIdTableName = IdTableName.find(params[:sourceGUIDS])
    @sourceTableName = @sourceIdTableName.tableName

    @destIdTableName = IdTableName.find(params[:destinationGUIDS])
    @destTableName = @destIdTableName.tableName

    @result = "fail"
    if ((@sourceTableName == "Event" and @destTableName == "Person") or
        (@sourceTableName == "Person" and @destTableName == "Event"))
      @source = Event.find(params[:sourceGUIDS])
      @dest = Person.find(params[:destinationGUIDS])
      @eventResource = EventResource.new
      @eventResource.eventId = @source.eventId
      @eventResource.resourceId = @dest.resourceId
      if @eventResource.save
        @result = "success"
      end
    elsif ((@sourceTableName == "Event" and @destTableName == "Place") or
        (@sourceTableName == "Place" and @destTableName == "Event"))
      @source = Event.find(params[:sourceGUIDS])
      @dest = Place.find(params[:destinationGUIDS])
      @eventPlace = EventPlace.new
      @eventPlace.eventId = @source.eventId
      @eventPlace.placeId = @dest.placeId
      if @eventPlace.save
        @result = "success"
      end
    elsif ((@sourceTableName == "Resource" and @destTableName == "Place") or
        (@sourceTableName == "Place" and @destTableName == "Resource"))
      @source = Resource.find(params[:sourceGUIDS])
      @dest = Place.find(params[:destinationGUIDS])
      @resourcePlace = ResourcePlace.new
      @resourcePlace.resourceId = @source.eventId
      @resourcePlace.placeId = @dest.placeId
      if @resourcePlace.save
        @result = "success"
      end
    end
    respond_to do |format|
      format.json { render :json => {:result => @result} }
    end
  end

  def get_properties
    #Request Parameters	Description	Example
    #GUID	 a GUID of an object	 “ABCD1234”
    #type (optional)  only get objects of specified type
    #depth (optional)	 number of association “hops” to follow (default 0, maximum is 1)	 A JSON tree structure
    #Expected Response of /GET_PROPERTIES
    #Reponse Parameters	Description	Example
    #type	 the type of the given GUID	 EVENT
    #object	 the object of the given GUID.	 A JSON tree structure

    @id = params[:GUID]
    @idTableName = IdTableName.find(@id)

    @tableName = @idTableName.tableName
    #TODO: check if tableName is valid
    @object = @tableName.constantize.find(@id)
    if params[:depth] == 1
      @associations = Array.new
      @type = params[:type]
      if @tableName == "Event" and (@type.nil? or @type == "Person")
        @associations << EventResource.find(:all, :conditions => ['eventId = ?', "#{@id}"])
      elsif @tableName == "Person" and (@type.nil? or @type == "Event")
        @associations << EventResource.find(:all, :conditions => ['resourceId = ?', "#{@id}"])
      elsif @tableName == "Event" and (@type.nil? or type == "Place")
        @associations << EventPlace.find(:all, :conditions => ['eventId = ?', "#{@id}"])
      elsif @tableName == "Place" and (@type.nil? or type == "Event")
        @associations << EventPlace.find(:all, :conditions => ['placeId = ?', "#{@id}"])
      elsif @tableName == "Resource" and (@type.nil? or type == "Place")
        @associations << ResourcePlace.find(:all, :conditions => ['resourceId = ?', "#{@id}"])
      elsif @tableName == "Place" and (@type.nil? or type == "Resource")
        @associations << ResourcePlace.find(:all, :conditions => ['placeId = ?', "#{@id}"])
      end
    end
    respond_to do |format|
      format.json { render :json => {:type => @tableName, :object => @object, :associated_guids => @associations}}
    end
  end

  def get_guid
    #Request Parameters	Description	Example
    #Type (optional)       only get GUID of specified types
    #ValueRange (optional)	 regular expression	 “[Ff][Ii][Rr][Ee]”
    #latRange (optional)	 the range of the latitude of the object if applicable	 [37.410333, 37.920211]
    #lonRange (optional)	 the range of the longitude of the object if applicable	 [-122.05876, -123.00219]
    #timeRange (optional)	 the range of the datetime of the object, use 0 to present it as not specified	 [2012-03-21 18:56:21, 2012-03-21 20:57:55] or [2012-03-21 18:56:21, 0]
    #Expected Response of /GET_GUID
    #Reponse Parameters	Description	Example
    #type    type of the given GUID
    #GUIDs	 an array of global resource IDs matching selection criteria.	 A JSON tree structure

    @type = params[:type]
    if params[:latRange].nil?
      @minLat = -1
      @maxLat = -1
    else
      @minLat = params[:latRange][0]
      @maxLat = params[:latRange][1]
    end
    if params[:lonRange].nil?
      @minLon = -1
      @maxLon = -1
    else
      @minLon = params[:lonRange][0]
      @maxLon = params[:lonRange][1]
    end
    if params[:dateRange].nil?
      @minTime = 0
      @maxTime = 0
    else
      @minTime = params[:dateRange][0]
      @maxTime = params[:dateRange][1]
    end

    @idTableNames = IdTableName.all
    @resultGuids = Array.new
    @idTableNames.each do |idTableName|
      next if !@type.nil? and @type != idTableName.tableName
      @id = idTableName.id
      case idTableName.tableName
        when "Event"
          @object = Event.find(@id)
          next if ((@minTime != 0 and @object.dateTime < @minTime.to_datetime) or
                   (@maxTime != 0 and @object.dateTime > @maxTime.to_datetime))
          @text = @object.label
          @place = EventPlace.find(:all, :conditions => ['eventId = ?', "#{@id}"])
        when "Person", "Thing"
          @object = Resource.find(@id)
          @text = @object.label
          @place = ResourcePlace.find(:all, :conditions => ['resourceId = ?', "#{@id}"])
        when "Place"
          @place = Place.find(@id)
          @text = @place.label
        when "Message"
          @object = Message.find(@id)
          @text = @object.payload
          @place = ResourcePlace.find(:all, :conditions => ['resourceId = ?', "#{@id}"])
        when "Conversation"
          @object = Message.find(@id)
          @text = @object.label
          @place = ResourcePlace.find(:all, :conditions => ['resourceId = ?', "#{@id}"])
      end
      if @text =~ /#{params[:valueRange]}/
        if (@minLat != -1 or @minLon != -1) and !@place.nil?
          @spatialThing = SpatialThing.find(@place.placeId)
          if (@minLat == -1 or (@minLat..@maxLat).cover?(@spatialThing.latitude)) and
              (@minLon == -1 or (@minLon..@maxLon).cover?(@spatialThing.longitude))
            @resultGuids << @id
          end
        else
          @resultGuids << @id
        end
      end
    end
    respond_to do |format|
      format.json { render :json => {:GUIDs => @resultGuids}, :callback => params[:callback] }
    end
  end
end
