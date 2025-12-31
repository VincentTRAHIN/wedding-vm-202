INSERT INTO public.site_content (key, content, page)
VALUES (
  'local_guide',
  '{
    "categories": [
        {
            "id": "visits",
            "title": "Lieux à Visiter",
            "icon": "MapPin",
            "items": [
                {
                    "name": "Pont du Gard",
                    "description": "Monument romain à 30min",
                    "distance": "25km",
                    "link": "https://www.pontdugard.fr",
                    "image": "/images/local/pont-du-gard.jpg"
                }
            ]
        },
        {
            "id": "services",
            "title": "Services",
            "icon": "Scissors",
            "items": [
                {
                    "name": "Salon Élégance",
                    "type": "Coiffeur",
                    "phone": "04 66 XX XX XX",
                    "address": "12 rue de la Paix, Nîmes"
                }
            ]
        },
        {
            "id": "transport",
            "title": "Taxis & Transport",
            "icon": "Car",
            "items": [
                {
                    "name": "Taxi Vergèze",
                    "phone": "06 XX XX XX XX",
                    "available_24h": true
                }
            ]
        }
    ]
  }'::jsonb,
  'dashboard'
) ON CONFLICT (key) DO NOTHING;
