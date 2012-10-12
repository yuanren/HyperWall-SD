class Person < ActiveRecord::Base
  self.table_name = 'Person'
  self.primary_key = 'resourceId'
  attr_accessible :resourceId

  validates_presence_of :resourceId
  validates_uniqueness_of :resourceId
end
