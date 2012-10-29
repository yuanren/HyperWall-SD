class Conversation < ActiveRecord::Base
  self.table_name = 'Conversation'
  self.primary_key = 'resourceId'

  attr_accessible :resourceId, :label, :lastUpdated, :isEscalated

  validates_presence_of :resourceId
  validates_uniqueness_of :resourceId

  has_many :message, :foreign_key => 'conversationResourceId'
end
