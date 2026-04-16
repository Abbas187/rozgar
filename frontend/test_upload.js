const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hpdidkucmwcymfjzgcpc.supabase.co';
const supabaseKey = 'sb_publishable_uj-Jdky5ZVdXU803jW_VGg_awUNiOIc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
    console.log("Testing Supabase Storage...");
    const fileContent = "test image content string";
    const { data, error } = await supabase
        .storage
        .from('avatars')
        .upload('test_avatar.jpg', fileContent, {
            contentType: 'image/jpeg',
            upsert: true
        });

    if (error) {
        console.error("DEBUG ERROR:", error);
    } else {
        console.log("DEBUG SUCCESS:", data);
    }
}
testUpload();
