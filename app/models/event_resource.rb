class EventResource < ActiveRecord::Base
  self.table_name = 'EventResource'

  belongs_to :event
  belongs_to :resource
  attr_accessible :eventId, :resourceId
end
