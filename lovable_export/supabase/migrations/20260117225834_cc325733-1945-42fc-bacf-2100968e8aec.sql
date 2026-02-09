-- Converter todos os trials expirados para plano free
UPDATE profiles 
SET plan = 'free' 
WHERE plan = 'trial' 
AND trial_ends_at < NOW();