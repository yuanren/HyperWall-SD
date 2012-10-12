class SpatialThing < ActiveRecord::Base
  self.table_name = 'SpatialThing'
  self.primary_key = 'placeId'
  # TODO: should primary_key be altitude, latitude and longitude?
  attr_accessible :placeId, :altitude, :latitude, :longitude

  validates_presence_of :placeId
  validates_uniqueness_of :placeId
end
