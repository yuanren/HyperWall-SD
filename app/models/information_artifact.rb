class InformationArtifact < ActiveRecord::Base
  self.table_name = 'InformationArtifact'
  self.primary_key = 'resourceId'

  attr_accessible :resourceId
  validates_presence_of :resourceId
  validates_uniqueness_of :resourceId
end
