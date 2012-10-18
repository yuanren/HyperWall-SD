class ImmutableAssociation < ActiveRecord::Base
  self.table_name = 'ImmutableAssociation'
  #self.primary_key = :associationId, :objectId

  attr_accessible :associationId, :objectId
end
