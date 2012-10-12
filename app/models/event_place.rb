class EventPlace < ActiveRecord::Base
  self.table_name = 'EventPlace'

  belongs_to :event
  belongs_to :place
  attr_accessible :eventId, :placeId
end
