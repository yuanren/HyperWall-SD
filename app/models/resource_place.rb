class ResourcePlace < ActiveRecord::Base
  self.table_name = 'ResourcePlace'
  self.primary_key = 'resourcePlaceId'

  attr_accessible :resourcePlaceId, :version, :dateTime, :placeId, :resourceId
end
