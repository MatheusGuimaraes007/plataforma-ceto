import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY
const supabaseUrlCC = import.meta.env.VITE_SUPABASE_URL_CC
const supabaseKeyCC = import.meta.env.VITE_SUPABASE_KEY_CC

if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL não está definida')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
export const supabaseCC = createClient(supabaseUrlCC, supabaseKeyCC)
