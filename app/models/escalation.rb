class Escalation < ActiveRecord::Base
  self.table_name = 'Escalation'

  before_validation(:on => :create) do
    self.id = 'I-' + UUIDTools::UUID.timestamp_create.to_s
  end
  attr_accessible :dateTime, :id, :label, :level
  validates_presence_of :id
  validates_uniqueness_of :id
end
