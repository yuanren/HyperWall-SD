require "uuidtools"

class Event < ActiveRecord::Base
  self.table_name = 'Event'
  self.primary_key = 'eventId'
  attr_accessible :eventId, :version, :dateTime, :hazard, :label
  before_validation(:on => :create) do
    self.eventId = UUIDTools::UUID.timestamp_create.to_s
    self.version = 1
  end
  validates_presence_of :eventId
  validates_uniqueness_of :eventId

  has_many :places, :through => :eventPlaces
  has_many :resources, :through => :eventResources
end
