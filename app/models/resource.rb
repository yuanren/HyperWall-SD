class Resource < ActiveRecord::Base
  self.table_name = 'Resource'
  self.primary_key = 'resourceId'

  attr_accessible :label, :resourceId, :version
  before_validation(:on => :create) do
    self.resourceId = UUIDTools::UUID.timestamp_create.to_s
  end
  validates_presence_of :resourceId
  validates_uniqueness_of :resourceId

  has_many :events, :through => :eventPlaces
  has_many :places, :through => :resourcePlaces
end
