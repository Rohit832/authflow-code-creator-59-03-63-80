import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InquiryData {
  first_name: string;
  last_name: string;
  work_email: string;
  mobile_number?: string;
  job_title?: string;
  company_name: string;
  company_size?: string;
  country?: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const inquiry: InquiryData = await req.json();
    console.log("Received inquiry data:", JSON.stringify(inquiry, null, 2));

    // Add client IP address - extract first IP from x-forwarded-for header
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    
    let clientIP = 'unknown';
    if (forwardedFor) {
      // x-forwarded-for can contain multiple IPs, take the first one
      clientIP = forwardedFor.split(',')[0].trim();
    } else if (realIP) {
      clientIP = realIP;
    }
    
    const inquiryWithIP = { 
      ...inquiry, 
      client_ip: clientIP 
    };

    console.log("Inquiry data with IP:", JSON.stringify(inquiryWithIP, null, 2));

    // Save inquiry to database
    const { data: inquiryRecord, error: dbError } = await supabase
      .from('inquiries')
      .insert([inquiryWithIP])
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error(`Failed to save inquiry to database: ${dbError.message}`);
    }

    console.log("Inquiry saved to database successfully:", inquiryRecord);

    // Fetch admin emails from admin_profiles
    const { data: adminProfiles, error: adminError } = await supabase
      .from('admin_profiles')
      .select('user_id, email')
      .eq('is_approved', true);

    if (adminError) {
      console.error("Error fetching admin profiles:", adminError);
      throw new Error("Failed to fetch admin emails");
    }

    if (!adminProfiles || adminProfiles.length === 0) {
      console.log("No admin users found");
      throw new Error("No admin users found to send notification");
    }

    // Use emails from admin_profiles table directly
    const adminEmails = adminProfiles
      .map(profile => profile.email)
      .filter(email => email); // Filter out any null/undefined emails

    if (adminEmails.length === 0) {
      console.log("No admin emails found");
      throw new Error("No admin emails found");
    }

    console.log("Admin emails found:", adminEmails);

    // Country code to full name mapping
    const getCountryName = (countryCode: string) => {
      const countryNames: { [key: string]: string } = {
        'US': 'United States', 'UK': 'United Kingdom', 'CA': 'Canada', 'AU': 'Australia',
        'DE': 'Germany', 'FR': 'France', 'ES': 'Spain', 'IT': 'Italy', 'NL': 'Netherlands',
        'BE': 'Belgium', 'CH': 'Switzerland', 'AT': 'Austria', 'SE': 'Sweden', 'NO': 'Norway',
        'DK': 'Denmark', 'FI': 'Finland', 'IE': 'Ireland', 'PT': 'Portugal', 'GR': 'Greece',
        'PL': 'Poland', 'CZ': 'Czech Republic', 'HU': 'Hungary', 'RO': 'Romania', 'BG': 'Bulgaria',
        'HR': 'Croatia', 'SI': 'Slovenia', 'SK': 'Slovakia', 'LT': 'Lithuania', 'LV': 'Latvia',
        'EE': 'Estonia', 'IN': 'India', 'CN': 'China', 'JP': 'Japan', 'KR': 'South Korea',
        'SG': 'Singapore', 'MY': 'Malaysia', 'TH': 'Thailand', 'ID': 'Indonesia', 'PH': 'Philippines',
        'VN': 'Vietnam', 'TW': 'Taiwan', 'HK': 'Hong Kong', 'BR': 'Brazil', 'MX': 'Mexico',
        'AR': 'Argentina', 'CL': 'Chile', 'CO': 'Colombia', 'PE': 'Peru', 'ZA': 'South Africa',
        'EG': 'Egypt', 'NG': 'Nigeria', 'KE': 'Kenya', 'RU': 'Russia', 'TR': 'Turkey',
        'SA': 'Saudi Arabia', 'AE': 'United Arab Emirates', 'IL': 'Israel', 'JO': 'Jordan',
        'LB': 'Lebanon', 'NZ': 'New Zealand'
      };
      return countryNames[countryCode] || countryCode;
    };

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="text-align: center; padding-bottom: 30px; border-bottom: 3px solid #007bff;">
          <h1 style="color: #007bff; margin: 0; font-size: 28px; font-weight: 600;">New Demo Request</h1>
          <p style="color: #6c757d; margin: 10px 0 0 0; font-size: 16px;">from Finsage Website</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #007bff;">
          <h2 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center;">
            <span style="background: #007bff; color: white; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 12px;">👤</span>
            Contact Information
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #495057; font-weight: 600; width: 130px;">Full Name:</td>
              <td style="padding: 8px 0; color: #212529; font-size: 16px;">${inquiry.first_name} ${inquiry.last_name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #495057; font-weight: 600;">Email:</td>
              <td style="padding: 8px 0;"><a href="mailto:${inquiry.work_email}" style="color: #007bff; text-decoration: none; font-weight: 500;">${inquiry.work_email}</a></td>
            </tr>
            ${inquiry.mobile_number ? `
            <tr>
              <td style="padding: 8px 0; color: #495057; font-weight: 600;">Mobile:</td>
              <td style="padding: 8px 0; color: #212529;"><a href="tel:${inquiry.mobile_number}" style="color: #007bff; text-decoration: none;">${inquiry.mobile_number}</a></td>
            </tr>
            ` : ''}
            ${inquiry.job_title ? `
            <tr>
              <td style="padding: 8px 0; color: #495057; font-weight: 600;">Job Title:</td>
              <td style="padding: 8px 0; color: #212529;">${inquiry.job_title}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; color: #495057; font-weight: 600;">Company:</td>
              <td style="padding: 8px 0; color: #212529; font-weight: 500;">${inquiry.company_name}</td>
            </tr>
            ${inquiry.company_size ? `
            <tr>
              <td style="padding: 8px 0; color: #495057; font-weight: 600;">Company Size:</td>
              <td style="padding: 8px 0; color: #212529;">${inquiry.company_size}</td>
            </tr>
            ` : ''}
            ${inquiry.country ? `
            <tr>
              <td style="padding: 8px 0; color: #495057; font-weight: 600;">Country:</td>
              <td style="padding: 8px 0; color: #212529;">${getCountryName(inquiry.country)}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; color: #495057; font-weight: 600;">IP Address:</td>
              <td style="padding: 8px 0; color: #212529; font-family: 'Courier New', monospace;">${clientIP}</td>
            </tr>
          </table>
        </div>

        ${inquiry.message ? `
        <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); padding: 25px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h2 style="color: #856404; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center;">
            <span style="background: #ffc107; color: #856404; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 12px;">💬</span>
            Message
          </h2>
          <div style="background: rgba(255, 255, 255, 0.8); padding: 15px; border-radius: 8px; border: 1px solid rgba(255, 193, 7, 0.3);">
            <p style="margin: 0; color: #495057; line-height: 1.6; white-space: pre-wrap; font-size: 15px;">${inquiry.message}</p>
          </div>
        </div>
        ` : ''}

        <div style="background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%); padding: 20px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #17a2b8;">
          <h3 style="color: #0c5460; margin: 0 0 15px 0; font-size: 16px;">📧 Next Steps</h3>
          <p style="margin: 0 0 10px 0; color: #495057; line-height: 1.5;">This inquiry was submitted through the Finsage website Book Demo form.</p>
          <p style="margin: 0; color: #495057; line-height: 1.5;">
            <strong>Please respond to:</strong> 
            <a href="mailto:${inquiry.work_email}" style="color: #007bff; text-decoration: none; font-weight: 500;">${inquiry.work_email}</a>
          </p>
        </div>

        <div style="text-align: center; padding-top: 30px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px;">
          <p style="margin: 0;">© 2025 Finsage - Financial Consulting</p>
          <p style="margin: 5px 0 0 0;">Automated notification from your inquiry management system</p>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Finsage Website <noreply@finsage.co>",
      to: adminEmails, // Send to all admin emails
      subject: `New Demo Request from ${inquiry.first_name} ${inquiry.last_name} at ${inquiry.company_name}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-inquiry-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);