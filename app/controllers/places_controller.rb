class PlacesController < ApplicationController
  # GET /places
  # GET /places.json
  def index
    @places = Place.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @places }
    end
  end

  # GET /places/1
  # GET /places/1.json
  def show
    @place = Place.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @place }
    end
  end

  # GET /places/new
  # GET /places/new.json
  def new
    @place = Place.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @place }
    end
  end

  # GET /places/1/edit
  def edit
    @place = Place.find(params[:id])
  end

  # POST /places
  # POST /places.json
  def create
    # find if this place is already created by searching its latitude and longitude
    @place = Place.find_by_sql(["select * from Place where latitude = ? and longitude = ?", params[:latitude], params[:longitude]])[0]
    if !@place.nil?
      respond_to do |format|
        format.html { redirect_to @place, notice: 'Place was already created.' }
        format.json { render :json => {:GUID => @place.placeId} }
      end
    else
      @place = Place.new
      @place.label = params[:label]
      @place.latitude = params[:latitude]
      @place.longitude = params[:longitude]
      @place.version = 1

      respond_to do |format|
        if @place.save
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

          format.html { redirect_to @place, notice: 'Place was successfully created.' }
          format.json { render :json => {:GUID => @place.placeId, :mutable => "false"} }
        else
          format.html { render action: "new" }
          format.json { render json: @place.errors, status: :unprocessable_entity }
        end
      end
    end
  end

  # PUT /places/1
  # PUT /places/1.json
  def update
    @place = Place.find(params[:id])

    respond_to do |format|
      if @place.update_attributes(params[:place])
        format.html { redirect_to @place, notice: 'Place was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @place.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /places/1
  # DELETE /places/1.json
  def destroy
    @place = Place.find(params[:id])
    @place.destroy

    respond_to do |format|
      format.html { redirect_to places_url }
      format.json { head :no_content }
    end
  end
end
