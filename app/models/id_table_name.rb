class IdTableName < ActiveRecord::Base
  self.table_name = 'IdTableName'
  self.primary_key = 'id'
  attr_accessible :id

  validates_presence_of :id
  validates_uniqueness_of :id
  attr_accessible :id, :tableName, :version
end
