class Point < ActiveRecord::Base
  self.table_name = 'Point'
  self.primary_key = 'placeId'
  attr_accessible :placeId

  validates_presence_of :placeId
  validates_uniqueness_of :placeId
end
