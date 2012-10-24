class Place < ActiveRecord::Base
  self.table_name = 'Place'
  self.primary_key = 'placeId'

  attr_accessible :placeId, :version, :label, :latitude, :longitude

  before_validation(:on => :create) do
    self.placeId = 'I-' + UUIDTools::UUID.timestamp_create.to_s
  end

  validates_presence_of :placeId
  validates_uniqueness_of :placeId
  has_many :events, :through => :eventPlaces
  has_many :resources, :through => :resourcePlaces
end
