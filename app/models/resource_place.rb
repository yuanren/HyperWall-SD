class ResourcePlace < ActiveRecord::Base
  self.table_name = 'ResourcePlace'
  self.primary_key = 'resourcePlaceId'

  before_validation(:on => :create) do
    self.resourcePlaceId = UUIDTools::UUID.timestamp_create.to_s
  end

  attr_accessible :resourcePlaceId, :version, :dateTime, :placeId, :resourceId
end
