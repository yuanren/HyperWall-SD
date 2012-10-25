class ConversationsController < ApplicationController
  # GET /conversations
  # GET /conversations.json
  def index
    @conversations = Conversation.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @conversations }
    end
  end

  # GET /conversations/1
  # GET /conversations/1.json
  def show
    @conversation = Conversation.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @conversation }
    end
  end

  # GET /conversations/new
  # GET /conversations/new.json
  def new
    @conversation = Conversation.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @conversation }
    end
  end

  # GET /conversations/1/edit
  def edit
    @conversation = Conversation.find(params[:id])
  end

  # POST /conversations
  # POST /conversations.json
  def create
    @conversation = Conversation.new
    @conversation.resourceId = 'M-' + UUIDTools::UUID.timestamp_create.to_s
    @conversation.label = params[:label]
    @conversation.lastUpdated = Time.now

    @resource = Resource.new
    @resource.resourceId = @conversation.resourceId
    @resource.label = params[:label]
    @resource.type = "Conversation"
    @resource.version = 1
    @resource.save

    @informationArtifact = InformationArtifact.new
    @informationArtifact.resourceId = @resource.resourceId
    @informationArtifact.type = "Conversation"
    @informationArtifact.save

    respond_to do |format|
      if @conversation.save
        @idTableName = IdTableName.new
        @idTableName.id = @conversation.resourceId
        @idTableName.tableName = "Conversation"
        @idTableName.version = 1
        @idTableName.save

        format.html { redirect_to @conversation, notice: 'Conversation was successfully created.' }
        format.json { render :json => {:GUID => @conversation.resourceId} }
      else
        format.html { render action: "new" }
        format.json { render json: @conversation.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /conversations/1
  # PUT /conversations/1.json
  def update
    @conversation = Conversation.find(params[:id])

    respond_to do |format|
      if @conversation.update_attributes(params[:conversation])
        format.html { redirect_to @conversation, notice: 'Conversation was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @conversation.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /conversations/1
  # DELETE /conversations/1.json
  def destroy
    @conversation = Conversation.find(params[:id])
    @conversation.destroy
    @idTableName = IdTableName.find(params[:id])
    @idTableName.destroy
    respond_to do |format|
      format.html { redirect_to conversations_url }
      format.json { head :no_content }
    end
  end

  # ESCALATE /conversations/1/escalate
  def escalate
    @conversation = Conversation.find(params[:id])
    @conversation.isEscalated = true
  end
end
