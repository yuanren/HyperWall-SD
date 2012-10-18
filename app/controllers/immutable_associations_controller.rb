class ImmutableAssociationsController < ApplicationController
  # GET /immutable_associations
  # GET /immutable_associations.json
  def index
    @immutable_associations = ImmutableAssociation.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @immutable_associations }
    end
  end

  # GET /immutable_associations/1
  # GET /immutable_associations/1.json
  def show
    @immutable_association = ImmutableAssociation.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @immutable_association }
    end
  end

end
