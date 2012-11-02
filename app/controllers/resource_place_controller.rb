class ResourcePlaceController < ApplicationController
  def add_breadcrumb
    #@place = Place.create(params[:ResourcePlace])

    @place = Place.find_by_sql(["select * from Place where latitude = ? and longitude = ?", params[:latitude], params[:longitude]])[0]
    if @place.nil?
      @place = Place.new
      @place.placeId = 'I-' + UUIDTools::UUID.timestamp_create.to_s
      @place.label = params[:label]
      @place.latitude = params[:latitude]
      @place.longitude = params[:longitude]
      @place.version = 1
      @place.save

      @point = Point.new
      @point.placeId = @place.placeId
      @point.save

      @spatialThing = SpatialThing.new
      @spatialThing.placeId = @point.placeId
      @spatialThing.latitude = params[:latitude]
      @spatialThing.longitude = params[:longitude]
      @spatialThing.altitude = 0.0
      @spatialThing.type = "Place"
      @spatialThing.save

      @idTableName = IdTableName.new
      @idTableName.id = @place.placeId
      @idTableName.tableName = "Place"
      @idTableName.version = 1
      @idTableName.save
    end

    @resourcePlace = ResourcePlace.new
    @resourcePlace.resourceId = params[:object]
    @resourcePlace.placeId = @place.placeId
    @resourcePlace.dateTime = Time.now
    @resourcePlace.version = 1
    if @resourcePlace.save
      @result = "Success"
    else
      @result = "Fail"
    end
    respond_to do |format|
      format.json { render :json => {:result => @result} }
    end
  end

  def get_breadcrumbs
    #Parameters	Description	Example
    #GUIDs	 an array of GUIDS to get their breadcrumbs	 ["ABCD1234", "ABCD5678"]
    #latRange (optional)	 the range of the latitude of the object if applicable	 [37.410333, 37.920211]
    #lonRange (optional)	 the range of the longitude of the object if applicable	 [-122.05876, -123.00219]
    #timeRange (optional)	 the range of the datetime of the object, use 0 to present it as not specified	 [2012-03-21 18:56:21, 2012-03-21 20:57:55] or [2012-03-21 18:56:21, 0]
    #Expected Response of /GET_BREADCRUMBS
    #Reponse Parameters	Description	Example
    #result	 an array of [guid, lat, lon, time] matching selection criteria.

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

    @guids = params[:GUIDs]
    @results = Array.new
    @guids.each do |guid|
      @resourcePlaces = ResourcePlace.find_all_by_resourceId(guid)
      if !@resourcePlaces.nil?
        @resourcePlaces.each do |resourcePlace|
          @place = Place.find_by_placeId(resourcePlace.placeId)
          if !@place.nil? and
              (@minLat == -1 or (@minLat..@maxLat).cover?(@place.latitude)) and
              (@minLon == -1 or (@minLon..@maxLon).cover?(@place.longitude)) and
              (@minTime == 0 or resourcePlace.dateTime >= @minTime.to_datetime) and
              (@maxTime == 0 or resourcePlace.dateTime <= @maxTime.to_datetime)
            @results << [guid, @place.latitude, @place.longitude, resourcePlace.dateTime]
          end
        end
      end
    end

    respond_to do |format|
      format.json { render :json => {:result => @results}}
    end
  end

  before_filter :cors_preflight_check
  after_filter :cors_set_access_control_headers

# For all responses in this controller, return the CORS access control headers.

  def cors_set_access_control_headers
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
    headers['Access-Control-Max-Age'] = "1728000"
  end

# If this is a preflight OPTIONS request, then short-circuit the
# request, return only the necessary headers and return an empty
# text/plain.

  def cors_preflight_check
    if request.method == :options
      headers['Access-Control-Allow-Origin'] = '*'
      headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
      headers['Access-Control-Allow-Headers'] = 'X-Requested-With, X-Prototype-Version'
      headers['Access-Control-Max-Age'] = '1728000'
      render :text => '', :content_type => 'text/plain'
    end
  end


end
