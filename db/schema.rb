# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 0) do

  create_table "ActuationService", :primary_key => "serviceId", :force => true do |t|
  end

  add_index "actuationservice", ["serviceId"], :name => "FKBA3E97C35313096"

  create_table "ComputationService", :primary_key => "serviceId", :force => true do |t|
  end

  add_index "computationservice", ["serviceId"], :name => "FK6EA5530E5313096"

  create_table "ConsumesInformationArtifact", :id => false, :force => true do |t|
    t.string "resourceId", :limit => 36, :null => false
    t.string "serviceId",  :limit => 36, :null => false
  end

  add_index "consumesinformationartifact", ["resourceId"], :name => "FK8BB31587E02F698"
  add_index "consumesinformationartifact", ["serviceId"], :name => "FK8BB3158740B8158D"
  add_index "consumesinformationartifact", ["serviceId"], :name => "FK8BB315875313096"

  create_table "Conversation", :primary_key => "resourceId", :force => true do |t|
  end

  add_index "conversation", ["resourceId"], :name => "FK35E930A3E02F698"

  create_table "Event", :primary_key => "eventId", :force => true do |t|
    t.integer  "version",               :null => false
    t.datetime "dateTime",              :null => false
    t.string   "hazard",   :limit => 1
    t.string   "label"
  end

  create_table "EventPlace", :id => false, :force => true do |t|
    t.string "eventId", :limit => 36, :null => false
    t.string "placeId", :limit => 36, :null => false
  end

  add_index "eventplace", ["eventId"], :name => "FKB0A6E2AD2780C360"
  add_index "eventplace", ["placeId"], :name => "FKB0A6E2AD5CADA8FA"

  create_table "EventResource", :id => false, :force => true do |t|
    t.string "eventId",    :limit => 36, :null => false
    t.string "resourceId", :limit => 36, :null => false
  end

  add_index "eventresource", ["eventId"], :name => "FKA98490A82780C360"
  add_index "eventresource", ["resourceId"], :name => "FKA98490A851044486"

  create_table "EventService", :id => false, :force => true do |t|
    t.string "eventId",   :limit => 36, :null => false
    t.string "serviceId", :limit => 36, :null => false
  end

  add_index "eventservice", ["eventId"], :name => "FKB631FEDB2780C360"
  add_index "eventservice", ["serviceId"], :name => "FKB631FEDB5313096"

  create_table "IdTableName", :force => true do |t|
    t.integer "version",   :null => false
    t.string  "tableName", :null => false
  end

  create_table "Image", :primary_key => "resourceId", :force => true do |t|
    t.string "uniformResourceLocator", :null => false
  end

  add_index "image", ["resourceId"], :name => "FK437B93BE02F698"

  create_table "InformationArtifact", :primary_key => "resourceId", :force => true do |t|
    t.string "type", :limit => 256
  end

  add_index "informationartifact", ["resourceId"], :name => "FK8724BAFE51044486"

  create_table "MeasurementService", :primary_key => "serviceId", :force => true do |t|
  end

  add_index "measurementservice", ["serviceId"], :name => "FKA9CDD3795313096"

  create_table "MeasurementValuePair", :primary_key => "resourceId", :force => true do |t|
    t.string "unitId", :limit => 36, :null => false
    t.float  "value",                :null => false
  end

  add_index "measurementvaluepair", ["resourceId"], :name => "FK4B9433AFE02F698"
  add_index "measurementvaluepair", ["unitId"], :name => "FK4B9433AF667EA972"

  create_table "Message", :primary_key => "resourceId", :force => true do |t|
    t.string "conversationResourceId", :limit => 36, :null => false
    t.string "fromResourceId",                       :null => false
    t.string "payload",                              :null => false
    t.string "toResourceId",                         :null => false
  end

  add_index "message", ["conversationResourceId"], :name => "FK9C2397E7EC10B23E"
  add_index "message", ["resourceId"], :name => "FK9C2397E7E02F698"

  create_table "Person", :primary_key => "resourceId", :force => true do |t|
  end

  add_index "person", ["resourceId"], :name => "FK8E48877551044486"

  create_table "Place", :primary_key => "placeId", :force => true do |t|
    t.integer "version", :null => false
    t.string  "label"
  end

  create_table "Point", :primary_key => "placeId", :force => true do |t|
  end

  add_index "point", ["placeId"], :name => "FK49B65705CADA8FA"

  create_table "ProducesInformationArtifact", :id => false, :force => true do |t|
    t.string "resourceId", :limit => 36, :null => false
    t.string "serviceId",  :limit => 36, :null => false
  end

  add_index "producesinformationartifact", ["resourceId"], :name => "FKF93C8C6BE02F698"
  add_index "producesinformationartifact", ["serviceId"], :name => "FKF93C8C6B40B8158D"
  add_index "producesinformationartifact", ["serviceId"], :name => "FKF93C8C6B5313096"

  create_table "ResourcePlace", :primary_key => "resourcePlaceId", :force => true do |t|
    t.integer  "version",                  :null => false
    t.datetime "dateTime",                 :null => false
    t.string   "placeId",    :limit => 36, :null => false
    t.string   "resourceId", :limit => 36, :null => false
  end

  add_index "resourceplace", ["placeId"], :name => "FK692BAD795CADA8FA"
  add_index "resourceplace", ["resourceId"], :name => "FK692BAD7951044486"

  create_table "Service", :primary_key => "serviceId", :force => true do |t|
    t.integer "version", :null => false
    t.string  "label"
  end

  create_table "ServiceResource", :id => false, :force => true do |t|
    t.string "resourceId", :limit => 36, :null => false
    t.string "serviceId",  :limit => 36, :null => false
  end

  add_index "serviceresource", ["resourceId"], :name => "FKF99921C351044486"
  add_index "serviceresource", ["serviceId"], :name => "FKF99921C35313096"

  create_table "SpatialThing", :primary_key => "placeId", :force => true do |t|
    t.float  "altitude",                 :null => false
    t.float  "latitude",                 :null => false
    t.float  "longitude",                :null => false
    t.string "type",      :limit => 256
  end

  add_index "spatialthing", ["placeId"], :name => "FKC530CE6A5CAF2583"

  create_table "Thing", :primary_key => "resourceId", :force => true do |t|
  end

  add_index "thing", ["resourceId"], :name => "FK4D094CE51044486"

  create_table "Unit", :primary_key => "unitId", :force => true do |t|
    t.integer "version",              :null => false
    t.string  "abbreviation"
    t.float   "conversionMultiplier"
    t.float   "conversionOffset"
    t.string  "description"
    t.string  "symbol"
    t.string  "typePrefix",           :null => false
    t.string  "uneceCommonCode"
  end

  create_table "resource", :primary_key => "resourceId", :force => true do |t|
    t.integer "version", :null => false
    t.string  "label"
    t.string  "type"
  end

end
