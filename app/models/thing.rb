class Thing < ActiveResource::Base
  self.table_name = 'Thing'
  self.primary_key = 'resourceId'
  attr_accessible :resourceId, :label

  validates_presence_of :resourceId
  validates_uniqueness_of :resourceId
end
