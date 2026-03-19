-- Cleanup registrations and cuotas for user willy_g62@yahoo.com.ar up to 2026-03-01
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'willy_g62@yahoo.com.ar';

    IF target_user_id IS NOT NULL THEN
        -- Delete from cuotas
        DELETE FROM public.cuotas 
        WHERE user_id = target_user_id 
          AND created_at <= '2026-03-01 23:59:59';

        -- Delete from students (registrations)
        DELETE FROM public.students 
        WHERE user_id = target_user_id 
          AND created_at <= '2026-03-01 23:59:59';

        RAISE NOTICE 'Deleted data for user willy_g62@yahoo.com.ar up to 2026-03-01';
    END IF;
END $$;
