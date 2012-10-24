class Person < ActiveRecord::Base
  self.table_name = 'Person'
  self.primary_key = 'resourceId'
  attr_accessible :resourceId, :label

  before_validation(:on => :create) do
    self.id = 'I-' + UUIDTools::UUID.timestamp_create.to_s
  end
  validates_presence_of :resourceId
  validates_uniqueness_of :resourceId
end
