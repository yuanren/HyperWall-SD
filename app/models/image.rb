class Image < ActiveRecord::Base
  self.table_name = 'Image'
  self.primary_key = 'resourceId'

  before_validation(:on => :create) do
    self.id = 'I-' + UUIDTools::UUID.timestamp_create.to_s
  end
  attr_accessible :imageBinary, :label, :resourceId, :dateTime
  validates_presence_of :resourceId
  validates_uniqueness_of :resourceId
end
