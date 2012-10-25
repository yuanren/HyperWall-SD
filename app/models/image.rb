class Image < ActiveRecord::Base
  self.table_name = 'Image'
  self.primary_key = 'resourceId'

  attr_accessible :imageBinary, :label, :resourceId, :dateTime
  validates_presence_of :resourceId
  validates_uniqueness_of :resourceId
end
