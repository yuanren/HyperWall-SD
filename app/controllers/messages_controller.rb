class MessagesController < ApplicationController
  # GET /messages
  # GET /messages.json
  def index
    @messages = Message.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @messages }
    end
  end

  # GET /messages/1
  # GET /messages/1.json
  def show
    @message = Message.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @message }
    end
  end

  # GET /messages/new
  # GET /messages/new.json
  def new
    @message = Message.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @message }
    end
  end

  # GET /messages/1/edit
  def edit
    @message = Message.find(params[:id])
  end

  # POST /messages
  # POST /messages.json
  def create
    @message = Message.new
    @message.resourceId = 'I-' + UUIDTools::UUID.timestamp_create.to_s
    @message.conversationResourceId = params[:conversation]
    @message.fromResourceId = params[:sender]
    @message.toResourceId = params[:recipient]
    @message.payload = params[:text]
    @message.dateTime = Time.now

    @resource = Resource.new
    @resource.resourceId = @message.resourceId
    @resource.version = 1
    @resource.type = "Message"
    @resource.save
    @informationArtifact = InformationArtifact.new
    @informationArtifact.resourceId = @resource.resourceId
    @informationArtifact.save

    respond_to do |format|
      if @message.save
        @idTableName = IdTableName.new
        @idTableName.id = @message.resourceId
        @idTableName.tableName = "Message"
        @idTableName.version = 1
        @idTableName.save

        @message.conversation.lastUpdated = @message.dateTime
        @message.conversation.save

        format.html { redirect_to @message, notice: 'Message was successfully created.' }
        #format.json { render json: @message, status: :created, location: @message }
        format.json { render :json => {:GUID => @message.resourceId} }
      else
        format.html { render action: "new" }
        format.json { render json: @message.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /messages/1
  # PUT /messages/1.json
  def update
    @message = Message.find(params[:id])

    respond_to do |format|
      if @message.update_attributes(params[:message])
        format.html { redirect_to @message, notice: 'Message was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @message.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /messages/1
  # DELETE /messages/1.json
  def destroy
    @message = Message.find(params[:id])
    @message.destroy

    respond_to do |format|
      format.html { redirect_to messages_url }
      format.json { head :no_content }
    end
  end
end
