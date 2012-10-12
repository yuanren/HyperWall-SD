curl -H "Content-Type: application/json" --data @post_event.json "http://localhost:3000/events.json"

curl -H "Content-Type: application/json" --data @post_person.json "http://localhost:3000/people.json"

curl -H "Content-Type: application/json" --data @post_conversation.json "http://localhost:3000/conversations.json"

curl -H "Content-Type: application/json" --data @post_message.json "http://localhost:3000/messages.json"

curl -H "Content-Type: application/json" --data @post_place.json "http://localhost:3000/places.json"

curl -H "Content-Type: application/json" --data @get_property.json "http://localhost:3000/get_properties"

curl -H "Content-Type: application/json" --data @get_guid.json "http://localhost:3000/get_guid"

curl -H "Content-Type: application/json" --data @associate_guids.json "http://localhost:3000/associate_guids"

