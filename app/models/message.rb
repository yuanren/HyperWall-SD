class Message < ActiveRecord::Base
  self.table_name = 'Message'
  self.primary_key = 'resourceId'

  attr_accessible :conversationResourceId, :fromResourceId, :payload, :toResourceId, :dateTime
  validates_presence_of :resourceId
  validates_uniqueness_of :resourceId

  belongs_to :conversation, :foreign_key => 'conversationResourceId'
end
