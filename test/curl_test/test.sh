curl -H "Content-Type: application/json" --data @post_event.json "http://localhost:3000/events.json"

curl -H "Content-Type: application/json" --data @post_person.json "http://localhost:3000/people.json"

curl -H "Content-Type: application/json" --data @post_conversation.json "http://localhost:3000/conversations.json"

curl -H "Content-Type: application/json" --data @post_image.json "http://localhost:3000/images.json"

curl -H "Content-Type: application/json" --data @post_image_2.json "http://localhost:3000/images.json"

curl -H "Content-Type: application/json" --data @post_message.json "http://localhost:3000/messages.json"

curl -H "Content-Type: application/json" --data @post_place.json "http://localhost:3000/places.json"

curl -H "Content-Type: application/json" --data @get_property.json "http://localhost:3000/get_properties"

curl -H "Content-Type: application/json" --data @get_property_2.json "http://localhost:3000/get_properties"

curl -H "Content-Type: application/json" --data @get_guid.json "http://localhost:3000/get_guid"

curl -H "Content-Type: application/json" --data @get_objects.json "http://localhost:3000/get_objects"

curl -H "Content-Type: application/json" --data @associate_guids.json "http://localhost:3000/associate_guids"

curl -H "Content-Type: application/json" --data @add_breadcrumb.json "http://localhost:3000/add_breadcrumb"

curl -H "Content-Type: application/json" --data @get_breadcrumbs.json "http://localhost:3000/get_breadcrumbs"

curl -H "Content-Type: application/json" --data @add_escalation.json "http://localhost:3000/escalations.json"

curl -H "Content-Type: application/json" --data @get_escalated_objects.json "http://localhost:3000/get_escalated_objects"

