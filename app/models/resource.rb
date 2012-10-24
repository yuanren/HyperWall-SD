class Resource < ActiveRecord::Base
  self.table_name = 'Resource'
  self.primary_key = 'resourceId'

  attr_accessible :label, :resourceId, :version
  validates_presence_of :resourceId
  validates_uniqueness_of :resourceId

  has_many :events, :through => :eventPlaces
  has_many :places, :through => :resourcePlaces
end
