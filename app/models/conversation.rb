class Conversation < ActiveRecord::Base
  self.table_name = 'Conversation'
  self.primary_key = 'resourceId'

  attr_accessible :resourceId
  validates_presence_of :resourceId
  validates_uniqueness_of :resourceId

  has_many :message
end
