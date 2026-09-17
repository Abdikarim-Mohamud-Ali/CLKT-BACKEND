const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendVerificationEmail(name, email, code) {


const result = await resend.emails.send({

    from: "CLKT <onboarding@resend.dev>",

    to: [email],

    subject: "Verify your CLKT account",

    html: `


<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

</head>

<body style="margin:0; padding:0; background:#f5f5f5; font-family:Arial, Helvetica, sans-serif; color:#222;">

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background:#f5f5f5; padding:40px 15px;"
>


<tr>

    <td align="center">


        <!-- MAIN EMAIL CARD -->

        <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="max-width:520px; background:#ffffff; border-radius:14px; overflow:hidden;"
        >


            <!-- CLKT HEADER -->

            <tr>

                <td
                    align="center"
                    style="background:#E00000; padding:25px 20px;"
                >

                    <img
                        src="https://abdikarim-mohamud-ali.github.io/CLKT-ASSETS/clkt-logo.svg"
                        alt="CLKT"
                        width="100"
                        style="display:block; width:100px; height:auto;"
                    >

                </td>

            </tr>


            <!-- EMAIL CONTENT -->

            <tr>

                <td style="padding:35px 35px 30px;">


                    <!-- PERSONAL GREETING -->

                    <h1
                        style="margin:0 0 12px; font-size:25px; line-height:1.3; color:#222;"
                    >
                        Hi ${name},
                    </h1>


                    <p
                        style="margin:0 0 25px; font-size:15px; line-height:1.6; color:#666;"
                    >
                        Welcome to CLKT!

                        Thank you for creating your CLKT account.

                        Please verify your email address using the
                        verification code below.
                    </p>


                    <!-- VERIFICATION CODE -->

                    <table
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="margin:0 0 25px;"
                    >

                        <tr>

                            <td
                                align="center"
                                style="background:#f7f7f7; border-radius:10px; padding:22px;"
                            >

                                <p
                                    style="margin:0 0 8px; font-size:12px; color:#888; text-transform:uppercase; letter-spacing:1px;"
                                >
                                    Verification code
                                </p>


                                <div
                                    style="font-size:32px; font-weight:700; letter-spacing:7px; color:#E00000;"
                                >
                                    ${code}
                                </div>

                            </td>

                        </tr>

                    </table>


                    <p
                        style="margin:0 0 28px; font-size:13px; line-height:1.5; color:#888; text-align:center;"
                    >
                        This verification code expires after
                        <strong>10 minutes</strong>.
                    </p>


                    <!-- ABOUT CLKT -->

                    <div
                        style="border-top:1px solid #eeeeee; padding-top:25px;"
                    >

                        <h2
                            style="margin:0 0 10px; font-size:18px; color:#222;"
                        >
                            About CLKT
                        </h2>


                        <p
                            style="margin:0; font-size:14px; line-height:1.6; color:#666;"
                        >
                            CLKT is a voice-first social platform
                            designed to help people connect,
                            communicate and share conversations
                            with their community.
                        </p>

                    </div>


                    <!-- CONTACT US -->

                    <div
                        style="border-top:1px solid #eeeeee; margin-top:25px; padding-top:25px;"
                    >

                        <h2
                            style="margin:0 0 10px; font-size:18px; color:#222;"
                        >
                            Contact Us
                        </h2>


                        <p
                            style="margin:0; font-size:14px; line-height:1.6; color:#666;"
                        >
                            If you need help or have feedback,
                            contact us at

                            <a
                                href="mailto:abdikarim.online.services@gmail.com"
                                style="color:#E00000; text-decoration:none;"
                            >
                                abdikarim.online.services@gmail.com
                            </a>

                        </p>

                    </div>


                </td>

            </tr>


            <!-- FOOTER -->

            <tr>

                <td
                    align="center"
                    style="background:#fafafa; border-top:1px solid #eeeeee; padding:20px;"
                >

                    <p
                        style="margin:0 0 7px; font-size:12px; color:#999;"
                    >
                        You received this email because an account
                        was created using this email address.
                    </p>


                    <p
                        style="margin:0; font-size:12px; color:#aaa;"
                    >
                        © 2026 CLKT. All rights reserved.
                    </p>

                </td>

            </tr>


        </table>


    </td>

</tr>


</table>

</body>

</html>


    `

});


return result;


}

module.exports = {


sendVerificationEmail: sendVerificationEmail


};
