class IdTableNameController < ApplicationController
  def associate_guids
    @association_id = UUIDTools::UUID.timestamp_create.to_s
    @result = "Success"
    params[:objects].each do |objectId|
      @immutable_association = ImmutableAssociation.new
      @immutable_association.associationId = @association_id
      @immutable_association.objectId = objectId
      if !@immutable_association.save
        @result = "Fail"
        break
      end
    end
    respond_to do |format|
      format.json { render json: {:result => @result} }
    end
  end

  def associate_guids_old
    @sourceIdTableName = IdTableName.find(params[:sourceGUID])
    @sourceTableName = @sourceIdTableName.tableName

    @destIdTableName = IdTableName.find(params[:destinationGUID])
    @destTableName = @destIdTableName.tableName

    @result = "fail"
    if ((@sourceTableName == "Event" and @destTableName == "Person") or
        (@sourceTableName == "Person" and @destTableName == "Event") or
        (@sourceTableName == "Event" and @destTableName == "Conversation") or
        (@sourceTableName == "Conversation" and @destTableName == "Event") or
        (@sourceTableName == "Event" and @destTableName == "Message") or
        (@sourceTableName == "Message" and @destTableName == "Event") or
        (@sourceTableName == "Event" and @destTableName == "Thing") or
        (@sourceTableName == "Thing" and @destTableName == "Event") or
        (@sourceTableName == "Event" and @destTableName == "Image") or
        (@sourceTableName == "Image" and @destTableName == "Event")
      )
      @source = Event.find(params[:sourceGUID])
      @dest = Person.find(params[:destinationGUID])
      @eventResource = EventResource.new
      @eventResource.eventId = @source.eventId
      @eventResource.resourceId = @dest.resourceId
      if @eventResource.save
        @result = "success"
      end
    elsif ((@sourceTableName == "Event" and @destTableName == "Place") or
        (@sourceTableName == "Place" and @destTableName == "Event"))
      @source = Event.find(params[:sourceGUID])
      @dest = Place.find(params[:destinationGUID])
      @eventPlace = EventPlace.new
      @eventPlace.eventId = @source.eventId
      @eventPlace.placeId = @dest.placeId
      if @eventPlace.save
        @result = "success"
      end
    elsif (
        (@sourceTableName == "Place" and @destTableName == "Person") or
        (@sourceTableName == "Person" and @destTableName == "Place") or
        (@sourceTableName == "Place" and @destTableName == "Conversation") or
        (@sourceTableName == "Conversation" and @destTableName == "Place") or
        (@sourceTableName == "Place" and @destTableName == "Message") or
        (@sourceTableName == "Message" and @destTableName == "Place") or
        (@sourceTableName == "Place" and @destTableName == "Thing") or
        (@sourceTableName == "Thing" and @destTableName == "Place") or
        (@sourceTableName == "Place" and @destTableName == "Image") or
        (@sourceTableName == "Image" and @destTableName == "Place")
        )
      @source = Resource.find(params[:sourceGUID])
      @dest = Place.find(params[:destinationGUID])
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
    #depth (optional)	 number of association “hops” to follow (default 0, maximum is 2)	 A JSON tree structure
    #Expected Response of /GET_PROPERTIES
    #Reponse Parameters	Description	Example
    #type	 the type of the given GUID	 EVENT
    #object	 the object of the given GUID.	 A JSON tree structure

    @id = params[:GUID]
    @type = params[:type]
    @idTableName = IdTableName.find_by_id(@id)
    if @idTableName.nil?
      respond_to do |format|
        format.json { render :json => {:error => "GUID doesn't exist"}}
      end
      return
    end
    @tableName = @idTableName.tableName
    #TODO: check if tableName is valid
    @object = @tableName.constantize.find(@id)
    @associatedObjects = Array.new
    if params[:depth].nil?
      @depth = 0
    else
      @depth = Integer(params[:depth])
    end
    if @depth >= 1
      # if object is a message, include its conversation in result and vice versa
      if @tableName == "Conversation" and @type.nil? or @type == "Message"
        @associatedObjects << ["Message", @object.message]
        # association from conversation to message is considered as one hop
        @depth -= 1
      end
      if @tableName == "Message" and @type.nil? or @type == "Conversation"
        @associatedObjects << ["Conversation", @object.conversation]
      end
    end
    if @depth >= 1
      # 1. get associations
      @associations = ImmutableAssociation.find_all_by_objectId(@id)
      if !@associations.nil?
        # 2. for each association get objects
        @associations.each do |association|
          @hash = Hash.new
          @hash["association"] = association
          @associatedObjectsPerAssociation = Array.new
          @objectAssociations = ImmutableAssociation.find_all_by_associationId(association.associationId)
          @objectAssociations.each do |objectAssociation|
            @objectId = objectAssociation.objectId
            @associatedTableName = IdTableName.find_last_by_objectId(@objectId).tableName
            if @type.nil? or @type == @associatedTableName
              @associatedObjectsPerAssociation << [@associatedTableName, @associatedTableName.constantize.find(@objectId)]
            end
          end
          @hash["objects"] = @associatedObjectsPerAssociation
          @associatedObjects << @hash
        end
      end
    end
    respond_to do |format|
      format.json { render :json => {:type => @tableName, :object => @object, :associated_objects => @associatedObjects}}
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
    #GUIDs	 an array of global resource IDs matching selection criteria.

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
    if params[:timeRange].nil?
      @minTime = 0
      @maxTime = 0
    else
      @minTime = params[:timeRange][0]
      if (@minTime == "0")
        @minTime = 0
      end
      @maxTime = params[:timeRange][1]
      if (@maxTime == "0")
        @maxTime = 0
      end
    end

    @idTableNames = IdTableName.all
    @resultGuids = Array.new
    @idTableNames.each do |idTableName|
      next if !@type.nil? and @type != idTableName.tableName
      @id = idTableName.id
      case idTableName.tableName
        when "Event"
          @object = Event.find_by_eventId(@id)
          next if @object.nil? or
              (@minTime != 0 and @object.dateTime < @minTime.to_datetime) or
              (@maxTime != 0 and @object.dateTime > @maxTime.to_datetime)
          @text = @object.label
        when "Person"
          @object = Person.find_by_resourceId(@id)
          next if @object.nil?
          @text = @object.label
        when "Thing"
          @object = Thing.find_by_resourceId(@id)
          next if @object.nil?
          @text = @object.label
        when "Image"
          @object = Image.find_by_resourceId(@id)
          next if @object.nil? or
              (@minTime != 0 and @object.dateTime < @minTime.to_datetime) or
              (@maxTime != 0 and @object.dateTime > @maxTime.to_datetime)
          @text = @object.label
        when "Place"
          @text = @place.label
        when "Message"
          @object = Message.find_by_resourceId(@id)
          next if @object.nil? or
              (@minTime != 0 and @object.dateTime < @minTime.to_datetime) or
              (@maxTime != 0 and @object.dateTime > @maxTime.to_datetime)
          @text = @object.payload
        when "Conversation"
          @object = Conversation.find_by_resourceId(@id)
          next if @object.nil?
          @text = @object.label
      end
      if @text.nil? or params[:valueRange].nil? or @text =~ /#{params[:valueRange]}/
        case idTableName.tableName
          when "Event"
            @eventPlace = EventPlace.find_last_by_eventId(@id)
            @place = Place.find_by_placeId(@eventPlace.placeId) if !@eventPlace.nil?
          when "Person", "Thing", "Image", "Message", "Conversation"
            @resourcePlace = ResourcePlace.find_last_by_resourceId(@id)
            @place = Place.find_by_placeId(@resourcePlace.placeId) if !@resourcePlace.nil?
          when "Place"
            @place = Place.find_by_placeId(@id)
        end
        if (@minLat != -1 or @minLon != -1) and !@place.nil?
          if (@minLat == -1 or (@minLat..@maxLat).cover?(@place.latitude)) and
             (@minLon == -1 or (@minLon..@maxLon).cover?(@place.longitude))
            @resultGuids << @id
          end
        else
          @resultGuids << @id
        end
      end
    end
    respond_to do |format|
      format.json { render :json => {:GUIDs => @resultGuids}}
    end
  end

  def get_objects
    #Request Parameters	Description	Example
    #Type (optional)       only get GUID of specified types
    #ValueRange (optional)	 regular expression	 “[Ff][Ii][Rr][Ee]”
    #latRange (optional)	 the range of the latitude of the object if applicable	 [37.410333, 37.920211]
    #lonRange (optional)	 the range of the longitude of the object if applicable	 [-122.05876, -123.00219]
    #timeRange (optional)	 the range of the datetime of the object, use 0 to present it as not specified	 [2012-03-21 18:56:21, 2012-03-21 20:57:55] or [2012-03-21 18:56:21, 0]
    #Expected Response of /get_objects
    #Reponse Parameters	Description	Example
    #GUIDs	 an array of objects matching selection criteria.

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
    if params[:timeRange].nil?
      @minTime = 0
      @maxTime = 0
    else
      @minTime = params[:timeRange][0]
      if (@minTime == "0")
        @minTime = 0
      end
      @maxTime = params[:timeRange][1]
      if (@maxTime == "0")
        @maxTime = 0
      end
    end

    @idTableNames = IdTableName.all
    @resultObjects = Array.new
    @idTableNames.each do |idTableName|
      next if !@type.nil? and @type != idTableName.tableName
      @id = idTableName.id
      case idTableName.tableName
        when "Event"
          @object = Event.find_by_eventId(@id)
          next if @object.nil? or
              (@minTime != 0 and @object.dateTime < @minTime.to_datetime) or
              (@maxTime != 0 and @object.dateTime > @maxTime.to_datetime)
          @text = @object.label
        when "Person"
          @object = Person.find_by_resourceId(@id)
          next if @object.nil?
          @text = @object.label
        when "Thing"
          @object = Thing.find_by_resourceId(@id)
          next if @object.nil?
          @text = @object.label
        when "Image"
          @object = Image.find_by_resourceId(@id)
          next if @object.nil? or
              (@minTime != 0 and @object.dateTime < @minTime.to_datetime) or
              (@maxTime != 0 and @object.dateTime > @maxTime.to_datetime)
          @text = @object.label
        when "Place"
          @text = @place.label
        when "Message"
          @object = Message.find_by_resourceId(@id)
          next if @object.nil? or
              (@minTime != 0 and @object.dateTime < @minTime.to_datetime) or
              (@maxTime != 0 and @object.dateTime > @maxTime.to_datetime)
          @text = @object.payload
        when "Conversation"
          @object = Conversation.find_by_resourceId(@id)
          next if @object.nil?
          @text = @object.label
      end
      if @text.nil? or params[:valueRange].nil? or @text =~ /#{params[:valueRange]}/
        case idTableName.tableName
          when "Event"
            @eventPlace = EventPlace.find_last_by_eventId(@id)
            @place = Place.find_by_placeId(@eventPlace.placeId) if !@eventPlace.nil?
          when "Person", "Thing", "Image", "Message", "Conversation"
            @resourcePlace = ResourcePlace.find_last_by_resourceId(@id)
            @place = Place.find_by_placeId(@resourcePlace.placeId) if !@resourcePlace.nil?
          when "Place"
            @place = Place.find_by_placeId(@id)
        end
        if (@minLat != -1 or @minLon != -1) and !@place.nil?
          if (@minLat == -1 or (@minLat..@maxLat).cover?(@place.latitude)) and
              (@minLon == -1 or (@minLon..@maxLon).cover?(@place.longitude))
            @resultObjects << @object
          end
        else
          @resultObjects << @object
        end
      end
    end
    respond_to do |format|
      format.json { render :json => {:objects => @resultObjects}}
    end
  end

  def search_in_conversation

  end
end
