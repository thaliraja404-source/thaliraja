-- Insert Thali Raja restaurant
INSERT INTO restaurants (id, name, phone, whatsapp_number, address, maps_url, opening_time, closing_time, is_open)
VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Thali Raja',
    '+91-PLACEHOLDER',
    '+91-PLACEHOLDER',
    'Placeholder Address, City',
    'https://maps.google.com/?q=placeholder',
    '11:00:00',
    '23:00:00',
    true
)
ON CONFLICT (id) DO NOTHING;
