class EscalationsController < ApplicationController
  # GET /escalations
  # GET /escalations.json
  def index
    @escalations = Escalation.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @escalations }
    end
  end

  # GET /escalations/1
  # GET /escalations/1.json
  def show
    @escalation = Escalation.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @escalation }
    end
  end

  # GET /escalations/new
  # GET /escalations/new.json
  def new
    @escalation = Escalation.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @escalation }
    end
  end

  # GET /escalations/1/edit
  def edit
    @escalation = Escalation.find(params[:id])
  end

  # POST /escalations
  # POST /escalations.json
  def create
    @escalation = Escalation.new
    @escalation.level = params[:level]
    @escalation.dateTime = Time.now
    @escalation.label = params[:label]
    respond_to do |format|
      if @escalation.save
        @idTableName = IdTableName.new
        @idTableName.id = @escalation.id
        @idTableName.tableName = "Escalation"
        @idTableName.version = 1
        @idTableName.save

        format.html { redirect_to @escalation, notice: 'Escalation was successfully created.' }
        format.json { render :json => {:GUID => @escalation.id, :mutable => "false"} }
      else
        format.html { render action: "new" }
        format.json { render json: @escalation.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /escalations/1
  # PUT /escalations/1.json
  def update
    @escalation = Escalation.find(params[:id])

    respond_to do |format|
      if @escalation.update_attributes(params[:escalation])
        format.html { redirect_to @escalation, notice: 'Escalation was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @escalation.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /escalations/1
  # DELETE /escalations/1.json
  def destroy
    @escalation = Escalation.find(params[:id])
    @escalation.destroy

    respond_to do |format|
      format.html { redirect_to escalations_url }
      format.json { head :no_content }
    end
  end
end
