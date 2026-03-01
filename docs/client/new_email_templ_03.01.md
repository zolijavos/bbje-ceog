Delivered-To: zoltan.javos@myforgelabs.com
Received: by 2002:a05:7010:e288:b0:508:4b64:37da with SMTP id lt8csp207340mdb;
        Fri, 27 Feb 2026 01:04:16 -0800 (PST)
X-Received: by 2002:a05:6000:2c09:b0:439:9892:9ec3 with SMTP id ffacd0b85a97d-4399ddd8744mr3343830f8f.3.1772183055675;
        Fri, 27 Feb 2026 01:04:15 -0800 (PST)
ARC-Seal: i=1; a=rsa-sha256; t=1772183055; cv=none;
        d=google.com; s=arc-20240605;
        b=cHIu0ciItIdFiJJ3rOgg0vkP//IUx0SI9QtljtozXUJdSSFGC1/5Lc1OsowcUUfmTe
         VLKF7Lppr8K+InBEybH3DmjthTJtfXtZxMUgR5KgojUEeg2k8TCCiAJHYTcutwq1y5oq
         /HjWi8U101Ra7LLe1h+de3yWOEyoTL4vXNVlSR47DTWPOkxMHKtT4CXhQFlkPcg41D/L
         UFNScnJm9eLagIM6loj8OF2U6k2HFQ8X3A5QXsbzxmzuA6iuXgutk1PbF8Z2+pgTwjCi
         5+5hjyXmcNZUxKKM3PO1goElcly6R3TC2R4IAvJzGokakXeQF99h4u7pFjXM2/I4eCSQ
         SAVw==
ARC-Message-Signature: i=1; a=rsa-sha256; c=relaxed/relaxed; d=google.com; s=arc-20240605;
        h=date:to:references:message-id:subject:mime-version:from
         :dkim-signature;
        bh=VT43tazUiDV4BDza8CxLMePzi/Et0jxPuXdPYNuJlA8=;
        fh=IEgonCz8U8bLDyP/r3Ex8pRxjF6HYeVpX+WjXz8U9Ig=;
        b=Dmty0JGaffz08zEm/QGZqgqe4A4Rgiwbt4AI4LlNsXVwECPlFauT1SBSWqxI/kgnPj
         KFp86zxLnUGvHZp4eQOAJ6v8NKESKCfX7Mur5wn05vBSwYM6FvAFk2r2G+wKebynR+D9
         LNDcvUZsDF6hn+/I+XCig0x36mxVcs1dlUxWhHxryM1LC2DBebTs+ygFI78ph+SwbwRi
         EGr1YUINe8Ycp0scWaDdcZKWFnOFKNKGhJwAIFc/coh5Bq3/MtqOr9yawNgW9kueCpoN
         iLBDTgLR9MxWNIhJQr52hk14v/XDt4G/7ezJT6Nz1SDemfZ8Jp/3AlBmcVim6eegTnwL
         LFlw==;
        dara=google.com
ARC-Authentication-Results: i=1; mx.google.com;
       dkim=pass (test mode) header.i=@prime-time.hu header.s=mx1authkey header.b=KOT4vqBy;
       spf=pass (google.com: domain of tordai.agnes@prime-time.hu designates 193.23.139.232 as permitted sender) smtp.mailfrom=tordai.agnes@prime-time.hu;
       dmarc=pass (p=REJECT sp=REJECT dis=NONE) header.from=prime-time.hu
Return-Path: <tordai.agnes@prime-time.hu>
Received: from mx1-232.e-tiger.net (mx1-232.e-tiger.net. [193.23.139.232])
        by mx.google.com with ESMTPS id ffacd0b85a97d-4399c72cccbsi4703937f8f.54.2026.02.27.01.04.15
        for <zoltan.javos@myforgelabs.com>
        (version=TLS1_3 cipher=TLS_AES_256_GCM_SHA384 bits=256/256);
        Fri, 27 Feb 2026 01:04:15 -0800 (PST)
Received-SPF: pass (google.com: domain of tordai.agnes@prime-time.hu designates 193.23.139.232 as permitted sender) client-ip=193.23.139.232;
Authentication-Results: mx.google.com;
       dkim=pass (test mode) header.i=@prime-time.hu header.s=mx1authkey header.b=KOT4vqBy;
       spf=pass (google.com: domain of tordai.agnes@prime-time.hu designates 193.23.139.232 as permitted sender) smtp.mailfrom=tordai.agnes@prime-time.hu;
       dmarc=pass (p=REJECT sp=REJECT dis=NONE) header.from=prime-time.hu
DKIM-Signature: v=1; a=rsa-sha256; q=dns/txt; c=relaxed/relaxed; d=prime-time.hu; s=mx1authkey; h=Date:To:References:Message-Id:Subject: Mime-Version:Content-Type:From:Sender:Reply-To:Cc:Content-Transfer-Encoding: Content-ID:Content-Description:Resent-Date:Resent-From:Resent-Sender: Resent-To:Resent-Cc:Resent-Message-ID:In-Reply-To:List-Id:List-Help: List-Unsubscribe:List-Subscribe:List-Post:List-Owner:List-Archive; bh=VT43tazUiDV4BDza8CxLMePzi/Et0jxPuXdPYNuJlA8=; b=KOT4vqBy6yO5uQsi3CTT6FLNdJ r0ovs9qrWQYRLnvPjB0/eTLubP2NYTubiOKWH4H8bV9xXL3x34M69BRV6iEqFzBH1JMLJbMYGmjov vYZaBnXZViHrExYTFnAb1/F0o9G/WJEBtC39WTPetDkFNVq/3U9uMK3hx7V4LTY/9l12i/DnL7D1f SVehH6ehq4Z7Kqp9c6wn08QoxE4vXnLeYhmpPd/oCbcfS2Qnw9ORjem+8Kv0NvEK1QfXvne76sjHb 08BKxyAPsuoHN1TKiCyana10TvYzGjxU6mn97B6u+tLT40m42wuXbQEk40Bm31tSY95qMeyxqY73I 9V0XICRw==;
Received: from Local SPAM/virus filter at mx1.e-tiger.net id 1vvtle-005eMz-RX; Fri, 27 Feb 2026 10:04:14 +0100
X-Virus-Scanned: amavisd-new at viacomkft.hu
Received: from mx1.e-tiger.net ([127.0.0.1]) by localhost (mx1.e-tiger.net [127.0.0.1]) (amavisd-new, port 2227) with ESMTP id 8kSBRWNCQDid; Fri, 27 Feb 2026 10:04:13 +0100 (CET)
Received: from [151.0.80.57] (port=5301 helo=smtpclient.apple) authenticated as tordai.agnes@prime-time.hu by mx1.e-tiger.net with esmtpsa TLS_Cipher=TLS1.2:ECDHE-RSA-AES256-GCM-SHA384:256 (Exim 4.95-NetSys #2) id 1vvtld-005eL6-9x; Fri, 27 Feb 2026 10:04:13 +0100
From: "Tordai Ágnes | Prime Time Comm" <tordai.agnes@prime-time.hu>
Content-Type: multipart/alternative; boundary="Apple-Mail=_DDD745D3-F878-45DB-B600-6A69B626C491"
Mime-Version: 1.0 (Mac OS X Mail 16.0 \(3864.400.21\))
Subject: SOS új SPECIÁLIS meghívó küldés SzFwd: Invitation to the CEO Gala 2026 - Minta meghívó
Message-Id: <4D12C13E-E0BC-41D1-8661-F3714D844BAC@prime-time.hu>
References: <003001dca7c5$61808200$24818600$@bbj.hu>
To: "Zoltán Javos" <zoltan.javos@myforgelabs.com>, "Javos Zoltán" <zolijavos@gmail.com>
Date: Fri, 27 Feb 2026 10:02:59 +0100
X-Mailer: Apple Mail (2.3864.400.21)

--Apple-Mail=_DDD745D3-F878-45DB-B600-6A69B626C491
Content-Transfer-Encoding: quoted-printable
Content-Type: text/plain; charset=utf-8

Szia Zoli, ezt a lenti, kieg=C3=A9sz=C3=ADtett megh=C3=ADv=C3=B3t ASAP ki k=
ellene k=C3=BCldeni. Legeslegk=C3=A9s=C5=91bb h=C3=A9tf=C5=91n.
K=C3=A9rlek, csin=C3=A1ld meg a h=C3=A1tteret hozz=C3=A1.=20

K=C3=B6szi,=20
=C3=81gi=20

=20
From: Cec=C3=ADlia Szoke (HU) <cecilia.szoke@pwc.com <mailto:cecilia.szoke@=
pwc.com>>=20
Sent: Friday, February 27, 2026 9:42 AM
To: balazs.roman@bbj.hu <mailto:balazs.roman@bbj.hu>
Cc: =C3=81d=C3=A1m Dallos (HU) <adam.dallos@pwc.com <mailto:adam.dallos@pwc=
.com>>; B=C3=A1lint Annam=C3=A1ria <annamaria.balint@bbj.hu <mailto:annamar=
ia.balint@bbj.hu>>
Subject: Fw: Invitation to the CEO Gala 2026 - Minta megh=C3=ADv=C3=B3
=20
=20
L=C3=A1szl=C3=B3 Radv=C3=A1nyi
CEO, PwC Hungary
=20

=20


=20


Dear Ms. Agnes Tordai,

PwC Hungary is pleased to invite you to the CEO Gala 2026 and to host you a=
t our corporate table.

The Budapest Business Journal and its official event partner, the Hungarian=
 Investment Promotion Agency (HIPA), are organising this highly prestigious=
 event, the official CEO Gala 2026 hosted at Corinthia Hotel Budapest on Fr=
iday, March 27, 2026.
As has now become a tradition of several years, two awards will be presente=
d during the evening: the Expat CEO Award, granted to the most successful a=
nd innovative expatriate CEO working in Hungary; and the CEO Community Awar=
d, bestowed to a Hungarian executive who has been a role model by being suc=
cessful in markets while demonstrating exceptional commitment to the commun=
ity. Two professional awards committees will choose the winners minutes bef=
ore the gala starts from a shortlist of three candidates.

Date: Friday, March 27, 2026, 7 p.m.

Location: The Grand Ballroom of the Corinthia Hotel Budapest

1073 Budapest, Erzs=C3=A9bet krt. 43-49

Dress Code: Black tie for men, ball gown or cocktail dress for women

If you wish to reserve your place at the gala, click the registration butto=
n below.

REGISTRATION=20

PwC Hungary is pleased to extend this personal invitation to you for the CE=
O Gala 2026. We would be delighted to host you at the PwC corporate table d=
uring the event. This invitation is personal and intended exclusively for t=
he addressee.

Due to the event's popularity and the limited seating, early registration i=
s strongly recommended to ensure participation. When you register, please l=
et us know if you have any special dietary requirements. We will send you a=
 feedback email after successful registration. Please kindly note that your=
 registration will only be finalised after having the official confirmation=
 received.
We remind you that any cancellations or changes to your registration must b=
e made at least ten business days before the gala. Cancellations should be =
sent to event@bbj.hu <mailto:event@bbj.hu?subject=3DInquiry%20regarding%20C=
EO%20Gala%202026>.
Please keep in mind that any failure on your part to provide due cancellati=
on notice may result in your being charged a no-show fee of HUF 99,000 + VA=
T per person.

We look forward to meeting you at the gala and celebrating our outstanding =
CEO Community.

Warm regards,

Tamas Botka
Publisher, BBJ
Balazs Roman
CEO, BBJ


=20

Business Publishing Services Kft. <https://urldefense.com/v3/__https:/bbj.h=
u/__;!!Nyu6ZXf5!rH0dHOey_yZFAKeVVIG5OJwqHdWUpf1l9WBokFc2LWiPLanuR3Zs4NVB-OI=
8NL1GjQZiqzI-EOHHNQnAHcmNz6r0bpCl-A$>
For more details about the event and the award, including previous winners =
<https://urldefense.com/v3/__https:/www.ceogala.com/__;!!Nyu6ZXf5!rH0dHOey_=
yZFAKeVVIG5OJwqHdWUpf1l9WBokFc2LWiPLanuR3Zs4NVB-OI8NL1GjQZiqzI-EOHHNQnAHcmN=
z6pHoma7wQ$>,
visit our website at www.ceogala.com <https://urldefense.com/v3/__https:/ww=
w.ceogala.com/__;!!Nyu6ZXf5!rH0dHOey_yZFAKeVVIG5OJwqHdWUpf1l9WBokFc2LWiPLan=
uR3Zs4NVB-OI8NL1GjQZiqzI-EOHHNQnAHcmNz6pHoma7wQ$>.
=C2=A9 Copyright, 2024-26
1075 Budapest, Mad=C3=A1ch I. =C3=BAt 13-14, Hungary
This email has been sent to you, because you are a customer or subscriber o=
f
BUSINESS PUBLISHING SERVICES KFT.
www.ceogala.com <https://urldefense.com/v3/__https:/www.ceogala.com/__;!!Ny=
u6ZXf5!rH0dHOey_yZFAKeVVIG5OJwqHdWUpf1l9WBokFc2LWiPLanuR3Zs4NVB-OI8NL1GjQZi=
qzI-EOHHNQnAHcmNz6pHoma7wQ$> - event@bbj.hu <mailto:event@bbj.hu?subject=3D=
Inquiry%20regarding%20CEO%20Gala%202026>
=20
"Privacy Statement/ Adatv=C3=A9delem (hyperlink: https://www.pwc.com/hu/hu/=
rolunk/privacy.html) The information transmitted is intended only for the p=
erson or entity to which it is addressed and may contain confidential and/o=
r privileged material. Any review, retransmission, dissemination or other u=
se of, or taking of any action in reliance upon, this information by person=
s or entities other than the intended recipient is prohibited. If you recei=
ved this in error, please contact the sender and delete the material from a=
ny computer. Please familiarize yourself with our privacy policy."=20

 <https://www.avast.com/sig-email?utm_medium=3Demail&utm_source=3Dlink&utm_=
campaign=3Dsig-email&utm_content=3Demailclient>=09V=C3=ADrusmentes.www.avas=
t.com <https://www.avast.com/sig-email?utm_medium=3Demail&utm_source=3Dlink=
&utm_campaign=3Dsig-email&utm_content=3Demailclient>

--Apple-Mail=_DDD745D3-F878-45DB-B600-6A69B626C491
Content-Transfer-Encoding: quoted-printable
Content-Type: text/html; charset=utf-8

<html aria-label=3D"message body"><head><meta http-equiv=3D"content-type" c=
ontent=3D"text/html; charset=3Dutf-8"></head><body style=3D"overflow-wrap: =
break-word; -webkit-nbsp-mode: space; line-break: after-white-space;">Szia =
Zoli, ezt a lenti, kieg=C3=A9sz=C3=ADtett megh=C3=ADv=C3=B3t ASAP ki kellen=
e k=C3=BCldeni. Legeslegk=C3=A9s=C5=91bb h=C3=A9tf=C5=91n.<div>K=C3=A9rlek,=
 csin=C3=A1ld meg a h=C3=A1tteret hozz=C3=A1.&nbsp;</div><div><br></div><di=
v>K=C3=B6szi,&nbsp;</div><div>=C3=81gi&nbsp;<br id=3D"lineBreakAtBeginningO=
fMessage"><div>
<meta charset=3D"UTF-8"><div dir=3D"auto" style=3D"font-family: Avenir; fon=
t-size: 12px; font-style: normal; font-variant-caps: normal; font-weight: 4=
00; letter-spacing: normal; orphans: auto; text-align: start; text-indent: =
0px; text-transform: none; white-space: normal; widows: auto; word-spacing:=
 0px; -webkit-text-stroke-width: 0px; text-decoration: none; caret-color: r=
gb(0, 0, 0); color: rgb(0, 0, 0); overflow-wrap: break-word; -webkit-nbsp-m=
ode: space; line-break: after-white-space;"><div dir=3D"auto" style=3D"care=
t-color: rgb(0, 0, 0); color: rgb(0, 0, 0); letter-spacing: normal; text-al=
ign: start; text-indent: 0px; text-transform: none; white-space: normal; wo=
rd-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration: none; ove=
rflow-wrap: break-word; -webkit-nbsp-mode: space; line-break: after-white-s=
pace;"><div><br></div></div></div></div><div><div class=3D"WordSection1" st=
yle=3D"page: WordSection1; caret-color: rgb(0, 0, 0); font-family: Avenir-B=
ook; font-size: 12px; font-style: normal; font-variant-caps: normal; font-w=
eight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-ind=
ent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacin=
g: 0px; -webkit-text-stroke-width: 0px; text-decoration-line: none; text-de=
coration-thickness: auto; text-decoration-style: solid;"><div style=3D"marg=
in: 0cm 0cm 0.0001pt; font-size: 12pt; font-family: &quot;Times New Roman&q=
uot;, serif;"><span style=3D"font-size: 11pt; font-family: Calibri, sans-se=
rif; color: rgb(31, 73, 125);"><o:p>&nbsp;</o:p></span></div><div><div styl=
e=3D"border-width: 1pt medium medium; border-style: solid none none; border=
-color: rgb(225, 225, 225) currentcolor currentcolor; border-image: none; p=
adding: 3pt 0cm 0cm;"><div style=3D"margin: 0cm 0cm 0.0001pt; font-size: 12=
pt; font-family: &quot;Times New Roman&quot;, serif;"><b><span style=3D"fon=
t-size: 11pt; font-family: Calibri, sans-serif;">From:</span></b><span styl=
e=3D"font-size: 11pt; font-family: Calibri, sans-serif;"><span class=3D"App=
le-converted-space">&nbsp;</span>Cec=C3=ADlia Szoke (HU) &lt;<a href=3D"mai=
lto:cecilia.szoke@pwc.com" style=3D"color: purple; text-decoration: underli=
ne;">cecilia.szoke@pwc.com</a>&gt;<span class=3D"Apple-converted-space">&nb=
sp;</span><br><b>Sent:</b><span class=3D"Apple-converted-space">&nbsp;</spa=
n>Friday, February 27, 2026 9:42 AM<br><b>To:</b><span class=3D"Apple-conve=
rted-space">&nbsp;</span><a href=3D"mailto:balazs.roman@bbj.hu" style=3D"co=
lor: purple; text-decoration: underline;">balazs.roman@bbj.hu</a><br><b>Cc:=
</b><span class=3D"Apple-converted-space">&nbsp;</span>=C3=81d=C3=A1m Dallo=
s (HU) &lt;<a href=3D"mailto:adam.dallos@pwc.com" style=3D"color: purple; t=
ext-decoration: underline;">adam.dallos@pwc.com</a>&gt;; B=C3=A1lint Annam=
=C3=A1ria &lt;<a href=3D"mailto:annamaria.balint@bbj.hu" style=3D"color: pu=
rple; text-decoration: underline;">annamaria.balint@bbj.hu</a>&gt;<br><b>Su=
bject:</b><span class=3D"Apple-converted-space">&nbsp;</span>Fw: Invitation=
 to the CEO Gala 2026 - Minta megh=C3=ADv=C3=B3<o:p></o:p></span></div></di=
v></div><div style=3D"margin: 0cm 0cm 0.0001pt; font-size: 12pt; font-famil=
y: &quot;Times New Roman&quot;, serif;"><o:p>&nbsp;</o:p></div><div><div st=
yle=3D"margin: 0cm 0cm 0.0001pt; font-size: 12pt; font-family: &quot;Times =
New Roman&quot;, serif;"><span style=3D"font-family: Georgia, serif;"><o:p>=
&nbsp;</o:p></span></div></div><div><div style=3D"margin: 0cm 0cm 0.0001pt;=
 font-size: 12pt; font-family: &quot;Times New Roman&quot;, serif;"><span s=
tyle=3D"font-family: Georgia, serif;">L=C3=A1szl=C3=B3 Radv=C3=A1nyi<o:p></=
o:p></span></div></div><div><div style=3D"margin: 0cm 0cm 0.0001pt; font-si=
ze: 12pt; font-family: &quot;Times New Roman&quot;, serif;"><span style=3D"=
font-family: Georgia, serif;">CEO, PwC Hungary<o:p></o:p></span></div></div=
><div><div style=3D"margin: 0cm 0cm 0.0001pt; font-size: 12pt; font-family:=
 &quot;Times New Roman&quot;, serif;"><span style=3D"font-family: Georgia, =
serif;"><o:p>&nbsp;</o:p></span></div></div><div><div style=3D"margin: 0cm =
0cm 0.0001pt; font-size: 12pt; font-family: &quot;Times New Roman&quot;, se=
rif;"><br></div></div><div id=3D"x_ms-outlook-mobile-signature"><div><div s=
tyle=3D"margin: 0cm 0cm 0.0001pt; font-size: 12pt; font-family: &quot;Times=
 New Roman&quot;, serif;"><span style=3D"font-family: Aptos;"><o:p>&nbsp;</=
o:p></span></div></div></div><div id=3D"x_mail-editor-reference-message-con=
tainer"><div id=3D"x_mail-editor-reference-message-container"><div class=3D=
"MsoNormal" align=3D"center" style=3D"margin: 0cm 0cm 0.0001pt; font-size: =
12pt; font-family: &quot;Times New Roman&quot;, serif; text-align: center;"=
></div><div style=3D"margin: 0cm 0cm 0.0001pt; font-size: 12pt; font-family=
: &quot;Times New Roman&quot;, serif;"><span style=3D"font-size: 9pt; font-=
family: Avenir, serif;"><br><br></span></div><div><p class=3D"MsoNormal" st=
yle=3D"margin: 0cm 0cm 12pt; font-size: 12pt; font-family: &quot;Times New =
Roman&quot;, serif;"><o:p>&nbsp;</o:p></p></div><div><table class=3D"MsoNor=
malTable" border=3D"0" cellspacing=3D"0" cellpadding=3D"0" width=3D"100%" s=
tyle=3D"width: 751px; background: white;"><tbody><tr><td style=3D"padding: =
0cm;"><div align=3D"center"><table class=3D"MsoNormalTable" border=3D"0" ce=
llspacing=3D"0" cellpadding=3D"0" width=3D"100%" style=3D"width: 709px; max=
-width: 680px;"><tbody><tr><td style=3D"padding: 0cm;"><div style=3D"margin=
: 0cm 0cm 0.0001pt; font-size: 12pt; font-family: &quot;Times New Roman&quo=
t;, serif; text-align: center;"><span style=3D"font-size: 11.5pt; font-fami=
ly: Verdana, sans-serif; color: rgb(51, 51, 51);"><img border=3D"0" id=3D"_=
x0000_i1027" src=3D"https://registration.ceogala.com/email-assets/CEO_Gala_=
2026_invitation_header_709x213.jpg" alt=3D"CEO Gala 2026 - March 27, 2026">=
</span><o:p></o:p></div></td></tr><tr><td style=3D"padding: 15pt 11.25pt;">=
<p align=3D"center" style=3D"margin: 0cm 0cm 13.5pt; font-size: 12pt; font-=
family: &quot;Times New Roman&quot;, serif; text-align: center;"><span styl=
e=3D"font-size: 11.5pt; font-family: Verdana, sans-serif; color: rgb(51, 51=
, 51);">Dear<span class=3D"Apple-converted-space">&nbsp;</span><b>Ms. Agnes=
 Tordai</b>,<o:p></o:p></span></p><p class=3D"elementtoproof" align=3D"cent=
er" style=3D"margin: 0cm 0cm 9pt; font-size: 12pt; font-family: &quot;Times=
 New Roman&quot;, serif; text-align: center; line-height: 15pt;"><b><span s=
tyle=3D"font-size: 11.5pt; font-family: Verdana, sans-serif; color: rgb(51,=
 51, 51);">PwC Hungary</span></b><span style=3D"font-size: 11.5pt; font-fam=
ily: Verdana, sans-serif; color: rgb(51, 51, 51);">&nbsp;is pleased to invi=
te you to the CEO Gala 2026 and to host you at our corporate table.<o:p></o=
:p></span></p><div style=3D"margin-bottom: 9pt;"><div style=3D"margin: 0cm =
0cm 0.0001pt; font-size: 12pt; font-family: &quot;Times New Roman&quot;, se=
rif; text-align: center; line-height: 15pt;"><span style=3D"font-size: 11.5=
pt; font-family: Verdana, sans-serif; color: rgb(51, 51, 51);">The Budapest=
 Business Journal and its official event partner, the<span class=3D"Apple-c=
onverted-space">&nbsp;</span><b>Hungarian Investment Promotion Agency (HIPA=
)</b>, are organising this highly prestigious event, the official<span clas=
s=3D"Apple-converted-space">&nbsp;</span><b>CEO Gala 2026</b>&nbsp;hosted a=
t<span class=3D"Apple-converted-space">&nbsp;</span><b>Corinthia Hotel Buda=
pest on Friday, March 27, 2026.</b><o:p></o:p></span></div></div><p align=
=3D"center" style=3D"margin: 0cm 0cm 9pt; font-size: 12pt; font-family: &qu=
ot;Times New Roman&quot;, serif; text-align: center;"><span style=3D"font-s=
ize: 11.5pt; font-family: Verdana, sans-serif; color: rgb(51, 51, 51);">As =
has now become a tradition of several years, two awards will be presented d=
uring the evening: the<span class=3D"Apple-converted-space">&nbsp;</span><b=
>Expat CEO Award</b>, granted to the most successful and innovative expatri=
ate CEO working in Hungary; and the<span class=3D"Apple-converted-space">&n=
bsp;</span><b>CEO Community Award</b>, bestowed to a Hungarian executive wh=
o has been a role model by being successful in markets while demonstrating =
exceptional commitment to the community. Two professional awards committees=
 will choose the winners minutes before the gala starts from a shortlist of=
 three candidates.<o:p></o:p></span></p><div align=3D"center"><table class=
=3D"MsoNormalTable" border=3D"0" cellspacing=3D"0" cellpadding=3D"0" width=
=3D"100%" style=3D"width: 679px;"><tbody><tr><td style=3D"padding: 2.25pt 0=
cm;"><div><p class=3D"MsoNormal" align=3D"center" style=3D"margin: 0cm 0cm =
15pt; font-size: 12pt; font-family: &quot;Times New Roman&quot;, serif; tex=
t-align: center;"><b><span style=3D"font-size: 11.5pt; font-family: Verdana=
, sans-serif; color: rgb(51, 51, 51);">Date:</span></b><span style=3D"font-=
size: 11.5pt; font-family: Verdana, sans-serif; color: rgb(51, 51, 51);">&n=
bsp;Friday, March 27, 2026, 7 p.m.<o:p></o:p></span></p></div></td></tr><tr=
><td style=3D"padding: 6pt 0cm;"></td></tr><tr><td style=3D"padding: 2.25pt=
 0cm;"><div><p class=3D"MsoNormal" align=3D"center" style=3D"margin: 0cm 0c=
m 15pt; font-size: 12pt; font-family: &quot;Times New Roman&quot;, serif; t=
ext-align: center;"><b><span style=3D"font-size: 11.5pt; font-family: Verda=
na, sans-serif; color: rgb(51, 51, 51);">Location:</span></b><span style=3D=
"font-size: 11.5pt; font-family: Verdana, sans-serif; color: rgb(51, 51, 51=
);">&nbsp;The Grand Ballroom of the Corinthia Hotel Budapest<o:p></o:p></sp=
an></p></div></td></tr><tr><td style=3D"padding: 2.25pt 0cm;"><div><p class=
=3D"MsoNormal" align=3D"center" style=3D"margin: 0cm 0cm 15pt; font-size: 1=
2pt; font-family: &quot;Times New Roman&quot;, serif; text-align: center;">=
<span style=3D"font-size: 11.5pt; font-family: Verdana, sans-serif; color: =
rgb(51, 51, 51);">1073 Budapest, Erzs=C3=A9bet krt. 43-49<o:p></o:p></span>=
</p></div></td></tr><tr><td style=3D"padding: 6pt 0cm;"></td></tr><tr><td s=
tyle=3D"padding: 2.25pt 0cm;"><div><p class=3D"MsoNormal" align=3D"center" =
style=3D"margin: 0cm 0cm 15pt; font-size: 12pt; font-family: &quot;Times Ne=
w Roman&quot;, serif; text-align: center;"><b><span style=3D"font-size: 11.=
5pt; font-family: Verdana, sans-serif; color: rgb(51, 51, 51);">Dress Code:=
</span></b><span style=3D"font-size: 11.5pt; font-family: Verdana, sans-ser=
if; color: rgb(51, 51, 51);">&nbsp;Black tie for men, ball gown or cocktail=
 dress for women<o:p></o:p></span></p></div></td></tr></tbody></table></div=
><p class=3D"elementtoproof" align=3D"center" style=3D"margin: 0cm 0cm 9pt;=
 font-size: 12pt; font-family: &quot;Times New Roman&quot;, serif; text-ali=
gn: center;"><span style=3D"font-size: 11.5pt; font-family: Verdana, sans-s=
erif; color: rgb(51, 51, 51);">If you wish to reserve your place at the gal=
a, click the registration button below.<o:p></o:p></span></p><div align=3D"=
center"><table class=3D"MsoNormalTable" border=3D"0" cellspacing=3D"0" cell=
padding=3D"0"><tbody><tr><td style=3D"background: rgb(196, 30, 58); padding=
: 9pt 26.25pt;"><div><p class=3D"MsoNormal" align=3D"center" style=3D"margi=
n: 0cm 0cm 15pt; font-size: 12pt; font-family: &quot;Times New Roman&quot;,=
 serif; text-align: center;"><span style=3D"font-size: 11.5pt; font-family:=
 Verdana, sans-serif; color: white;">REGISTRATION&nbsp;<o:p></o:p></span></=
p></div></td></tr></tbody></table></div><p class=3D"elementtoproof" align=
=3D"center" style=3D"margin: 0cm 0cm 9pt; font-size: 12pt; font-family: &qu=
ot;Times New Roman&quot;, serif; text-align: center; line-height: 15pt;"><u=
><span style=3D"font-size: 11.5pt; font-family: Verdana, sans-serif; color:=
 rgb(51, 51, 51);">PwC Hungary is pleased to extend this personal invitatio=
n to you for the CEO Gala 2026. We would be delighted to host you at the Pw=
C corporate table during the event. This invitation is personal and intende=
d exclusively for the addressee.</span></u><span style=3D"font-size: 11.5pt=
; font-family: Verdana, sans-serif; color: rgb(51, 51, 51);"><o:p></o:p></s=
pan></p><div style=3D"margin-bottom: 9pt;"><div style=3D"margin: 0cm 0cm 0.=
0001pt; font-size: 12pt; font-family: &quot;Times New Roman&quot;, serif; t=
ext-align: center; line-height: 15pt;"><span style=3D"font-size: 11.5pt; fo=
nt-family: Verdana, sans-serif; color: rgb(51, 51, 51);">Due to the event's=
 popularity and the limited seating, early registration is strongly recomme=
nded to ensure participation. When you register, please let us know if you =
have any special dietary requirements. We will send you a feedback email af=
ter successful registration. Please kindly note that your registration will=
 only be finalised after having the official confirmation received.<o:p></o=
:p></span></div></div><div style=3D"margin: 0cm 0cm 0.0001pt; font-size: 12=
pt; font-family: &quot;Times New Roman&quot;, serif; text-align: center;"><=
span style=3D"font-size: 11.5pt; font-family: Verdana, sans-serif; color: r=
gb(51, 51, 51);">We remind you that any cancellations or changes to your re=
gistration must be made at least ten business days before the gala. Cancell=
ations should be sent to<span class=3D"Apple-converted-space">&nbsp;</span>=
<u><a href=3D"mailto:event@bbj.hu?subject=3DInquiry%20regarding%20CEO%20Gal=
a%202026" id=3D"OWAfb495fef-61ae-0db1-0a25-34935679dbec" style=3D"color: pu=
rple; text-decoration: underline;"><span style=3D"color: rgb(51, 51, 51);">=
event@bbj.hu</span></a></u>.<o:p></o:p></span></div><p align=3D"center" sty=
le=3D"margin: 0cm 0cm 9pt; font-size: 12pt; font-family: &quot;Times New Ro=
man&quot;, serif; text-align: center;"><span style=3D"font-size: 11.5pt; fo=
nt-family: Verdana, sans-serif; color: rgb(51, 51, 51);">Please keep in min=
d that any failure on your part to provide due cancellation notice may resu=
lt in your being charged a no-show fee of<span class=3D"Apple-converted-spa=
ce">&nbsp;</span><b>HUF 99,000 + VAT</b>&nbsp;per person.<o:p></o:p></span>=
</p><p align=3D"center" style=3D"margin: 0cm 0cm 9pt; font-size: 12pt; font=
-family: &quot;Times New Roman&quot;, serif; text-align: center;"><span sty=
le=3D"font-size: 11.5pt; font-family: Verdana, sans-serif; color: rgb(51, 5=
1, 51);">We look forward to meeting you at the gala and celebrating our out=
standing CEO Community.<o:p></o:p></span></p><p style=3D"margin: 0cm 0cm 6p=
t; font-size: 12pt; font-family: &quot;Times New Roman&quot;, serif;"><span=
 style=3D"font-size: 11.5pt; font-family: Verdana, sans-serif; color: rgb(5=
1, 51, 51);">Warm regards,<o:p></o:p></span></p><div align=3D"center"><tabl=
e class=3D"MsoNormalTable" border=3D"0" cellspacing=3D"0" cellpadding=3D"0"=
 width=3D"100%" id=3D"table_0" style=3D"width: 679px;"><tbody><tr><td width=
=3D"50%" valign=3D"top" style=3D"width: 319.5px; padding: 0cm 7.5pt;"><p al=
ign=3D"center" style=3D"margin: 0cm 0cm 1.5pt; font-size: 12pt; font-family=
: &quot;Times New Roman&quot;, serif; text-align: center;"><b><span style=
=3D"font-size: 11.5pt; font-family: Verdana, sans-serif; color: rgb(26, 26,=
 46);">Tamas Botka</span></b><span style=3D"font-size: 11.5pt; font-family:=
 Verdana, sans-serif; color: rgb(26, 26, 46);"><o:p></o:p></span></p><div><=
div style=3D"margin: 0cm 0cm 0.0001pt; font-size: 12pt; font-family: &quot;=
Times New Roman&quot;, serif; text-align: center;"><span style=3D"font-size=
: 10.5pt; font-family: Verdana, sans-serif; color: rgb(51, 51, 51);">Publis=
her, BBJ<o:p></o:p></span></div></div></td><td width=3D"50%" valign=3D"top"=
 style=3D"width: 319.5px; padding: 0cm 7.5pt;"><p align=3D"center" style=3D=
"margin: 0cm 0cm 1.5pt; font-size: 12pt; font-family: &quot;Times New Roman=
&quot;, serif; text-align: center;"><b><span style=3D"font-size: 11.5pt; fo=
nt-family: Verdana, sans-serif; color: rgb(26, 26, 46);">Balazs Roman</span=
></b><span style=3D"font-size: 11.5pt; font-family: Verdana, sans-serif; co=
lor: rgb(26, 26, 46);"><o:p></o:p></span></p><div><div style=3D"margin: 0cm=
 0cm 0.0001pt; font-size: 12pt; font-family: &quot;Times New Roman&quot;, s=
erif; text-align: center;"><span style=3D"font-size: 10.5pt; font-family: V=
erdana, sans-serif; color: rgb(51, 51, 51);">CEO, BBJ<o:p></o:p></span></di=
v></div></td></tr></tbody></table></div><p class=3D"MsoNormal" align=3D"cen=
ter" style=3D"margin: 0cm 0cm 0.0001pt; font-size: 12pt; font-family: &quot=
;Times New Roman&quot;, serif; text-align: center;"></p><div align=3D"cente=
r"><table class=3D"MsoNormalTable" border=3D"0" cellspacing=3D"0" cellpaddi=
ng=3D"0" width=3D"100%" style=3D"width: 679px;"><tbody><tr><td style=3D"pad=
ding: 0cm;"><p class=3D"MsoNormal" align=3D"center" style=3D"margin: 0cm 0c=
m 22.5pt; font-size: 12pt; font-family: &quot;Times New Roman&quot;, serif;=
 text-align: center;"><span style=3D"font-size: 11.5pt; font-family: Verdan=
a, sans-serif; color: rgb(51, 51, 51);"><img border=3D"0" width=3D"300" id=
=3D"_x0000_i1028" src=3D"https://registration.ceogala.com/email-assets/bbj-=
logo.png" alt=3D"Budapest Business Journal" style=3D"width: 3.125in;"></spa=
n><o:p></o:p></p></td></tr></tbody></table></div><p class=3D"MsoNormal" ali=
gn=3D"center" style=3D"margin: 0cm 0cm 0.0001pt; font-size: 12pt; font-fami=
ly: &quot;Times New Roman&quot;, serif; text-align: center;"></p><div align=
=3D"center"><table class=3D"MsoNormalTable" border=3D"0" cellspacing=3D"0" =
cellpadding=3D"0" width=3D"100%" style=3D"width: 679px;"><tbody><tr><td sty=
le=3D"border-width: 1pt medium medium; border-style: solid none none; borde=
r-color: rgb(204, 204, 204) currentcolor currentcolor; border-image: none; =
padding: 0cm;"><p class=3D"MsoNormal" align=3D"center" style=3D"margin: 0cm=
 0cm 18.75pt; font-size: 12pt; font-family: &quot;Times New Roman&quot;, se=
rif; text-align: center;"><span style=3D"font-size: 1pt; font-family: Verda=
na, sans-serif; color: rgb(51, 51, 51);">&nbsp;<o:p></o:p></span></p></td><=
/tr></tbody></table></div><p class=3D"MsoNormal" align=3D"center" style=3D"=
margin: 0cm 0cm 0.0001pt; font-size: 12pt; font-family: &quot;Times New Rom=
an&quot;, serif; text-align: center;"></p><div align=3D"center"><table clas=
s=3D"MsoNormalTable" border=3D"0" cellspacing=3D"0" cellpadding=3D"0" width=
=3D"100%" style=3D"width: 679px;"><tbody><tr><td style=3D"padding: 11.25pt =
0cm;"><div style=3D"margin: 0cm 0cm 0.0001pt; font-size: 12pt; font-family:=
 &quot;Times New Roman&quot;, serif; text-align: center;"><u><span style=3D=
"font-size: 9pt; font-family: Verdana, sans-serif; color: rgb(51, 51, 51);"=
><a href=3D"https://urldefense.com/v3/__https:/bbj.hu/__;!!Nyu6ZXf5!rH0dHOe=
y_yZFAKeVVIG5OJwqHdWUpf1l9WBokFc2LWiPLanuR3Zs4NVB-OI8NL1GjQZiqzI-EOHHNQnAHc=
mNz6r0bpCl-A$" id=3D"OWA5789b4dc-f37b-aaeb-14bf-c3091884bcfa" style=3D"colo=
r: purple; text-decoration: underline;"><span style=3D"color: rgb(51, 51, 5=
1);">Business Publishing Services Kft.</span></a></span></u><span style=3D"=
font-size: 9pt; font-family: Verdana, sans-serif; color: rgb(102, 102, 102)=
;"><o:p></o:p></span></div><div style=3D"margin: 0cm 0cm 0.0001pt; font-siz=
e: 12pt; font-family: &quot;Times New Roman&quot;, serif; text-align: cente=
r;"><span style=3D"font-size: 9pt; font-family: Verdana, sans-serif; color:=
 rgb(102, 102, 102);">For more details about the event and the award,<span =
class=3D"Apple-converted-space">&nbsp;</span></span><u><span style=3D"font-=
size: 9pt; font-family: Verdana, sans-serif; color: rgb(51, 51, 51);"><a hr=
ef=3D"https://urldefense.com/v3/__https:/www.ceogala.com/__;!!Nyu6ZXf5!rH0d=
HOey_yZFAKeVVIG5OJwqHdWUpf1l9WBokFc2LWiPLanuR3Zs4NVB-OI8NL1GjQZiqzI-EOHHNQn=
AHcmNz6pHoma7wQ$" id=3D"OWA613597fc-05d9-4c39-5c23-89345b7efc04" style=3D"c=
olor: purple; text-decoration: underline;"><span style=3D"color: rgb(51, 51=
, 51);">including previous winners</span></a></span></u><span style=3D"font=
-size: 9pt; font-family: Verdana, sans-serif; color: rgb(102, 102, 102);">,=
<br>visit our website at<span class=3D"Apple-converted-space">&nbsp;</span>=
</span><u><span style=3D"font-size: 9pt; font-family: Verdana, sans-serif; =
color: rgb(51, 51, 51);"><a href=3D"https://urldefense.com/v3/__https:/www.=
ceogala.com/__;!!Nyu6ZXf5!rH0dHOey_yZFAKeVVIG5OJwqHdWUpf1l9WBokFc2LWiPLanuR=
3Zs4NVB-OI8NL1GjQZiqzI-EOHHNQnAHcmNz6pHoma7wQ$" id=3D"OWA2e4530ae-2e0c-af0f=
-5357-c9208f5db033" style=3D"color: purple; text-decoration: underline;"><s=
pan style=3D"color: rgb(51, 51, 51);">www.ceogala.com</span></a></span></u>=
<span style=3D"font-size: 9pt; font-family: Verdana, sans-serif; color: rgb=
(102, 102, 102);">.<o:p></o:p></span></div><p align=3D"center" style=3D"mar=
gin: 0cm 0cm 3pt; font-size: 12pt; font-family: &quot;Times New Roman&quot;=
, serif; text-align: center;"><span style=3D"font-size: 8.5pt; font-family:=
 Verdana, sans-serif; color: rgb(102, 102, 102);">=C2=A9 Copyright, 2024-26=
<br>1075 Budapest, Mad=C3=A1ch I. =C3=BAt 13-14, Hungary<o:p></o:p></span><=
/p><div style=3D"margin: 0cm 0cm 0.0001pt; font-size: 12pt; font-family: &q=
uot;Times New Roman&quot;, serif; text-align: center;"><span style=3D"font-=
size: 8.5pt; font-family: Verdana, sans-serif; color: rgb(102, 102, 102);">=
This email has been sent to you, because you are a customer or subscriber o=
f<br>BUSINESS PUBLISHING SERVICES KFT.<br></span><u><span style=3D"font-siz=
e: 8.5pt; font-family: Verdana, sans-serif; color: rgb(51, 51, 51);"><a hre=
f=3D"https://urldefense.com/v3/__https:/www.ceogala.com/__;!!Nyu6ZXf5!rH0dH=
Oey_yZFAKeVVIG5OJwqHdWUpf1l9WBokFc2LWiPLanuR3Zs4NVB-OI8NL1GjQZiqzI-EOHHNQnA=
HcmNz6pHoma7wQ$" id=3D"OWA7781b32d-9d36-ffe6-19c6-e318b462f06d" style=3D"co=
lor: purple; text-decoration: underline;"><span style=3D"color: rgb(51, 51,=
 51);">www.ceogala.com</span></a></span></u><span style=3D"font-size: 8.5pt=
; font-family: Verdana, sans-serif; color: rgb(102, 102, 102);">&nbsp;-<spa=
n class=3D"Apple-converted-space">&nbsp;</span></span><u><span style=3D"fon=
t-size: 8.5pt; font-family: Verdana, sans-serif; color: rgb(51, 51, 51);"><=
a href=3D"mailto:event@bbj.hu?subject=3DInquiry%20regarding%20CEO%20Gala%20=
2026" id=3D"OWAff2542b3-0487-a000-84d1-3b7c43067055" style=3D"color: purple=
; text-decoration: underline;"><span style=3D"color: rgb(51, 51, 51);">even=
t@bbj.hu</span></a></span></u><span style=3D"font-size: 8.5pt; font-family:=
 Verdana, sans-serif; color: rgb(102, 102, 102);"><o:p></o:p></span></div><=
/td></tr></tbody></table></div></td></tr></tbody></table></div></td></tr></=
tbody></table></div><div><div style=3D"margin: 0cm 0cm 0.0001pt; font-size:=
 12pt; font-family: &quot;Times New Roman&quot;, serif;"><o:p>&nbsp;</o:p><=
/div></div></div></div><div style=3D"margin: 0cm 0cm 0.0001pt; font-size: 1=
2pt; font-family: &quot;Times New Roman&quot;, serif;">"Privacy Statement/ =
Adatv=C3=A9delem (hyperlink:<span class=3D"Apple-converted-space">&nbsp;</s=
pan><a href=3D"https://www.pwc.com/hu/hu/rolunk/privacy.html" style=3D"colo=
r: purple; text-decoration: underline;">https://www.pwc.com/hu/hu/rolunk/pr=
ivacy.html</a>) The information transmitted is intended only for the person=
 or entity to which it is addressed and may contain confidential and/or pri=
vileged material. Any review, retransmission, dissemination or other use of=
, or taking of any action in reliance upon, this information by persons or =
entities other than the intended recipient is prohibited. If you received t=
his in error, please contact the sender and delete the material from any co=
mputer. Please familiarize yourself with our privacy policy."<span class=3D=
"Apple-converted-space">&nbsp;</span><o:p></o:p></div></div><div id=3D"DAB4=
FAD8-2DD7-40BB-A1B8-4E2AA1F9FDF2" style=3D"caret-color: rgb(0, 0, 0); font-=
family: Avenir-Book; font-size: 12px; font-style: normal; font-variant-caps=
: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align:=
 start; text-indent: 0px; text-transform: none; white-space: normal; widows=
: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-lin=
e: none; text-decoration-thickness: auto; text-decoration-style: solid;"><b=
r><table style=3D"border-top-width: 1px; border-top-style: solid; border-to=
p-color: rgb(211, 212, 222);"><tbody><tr><td style=3D"width: 55px; padding-=
top: 13px;"><a href=3D"https://www.avast.com/sig-email?utm_medium=3Demail&a=
mp;utm_source=3Dlink&amp;utm_campaign=3Dsig-email&amp;utm_content=3Demailcl=
ient" target=3D"_blank" style=3D"color: purple; text-decoration: underline;=
"><img src=3D"https://s-install.avcdn.net/ipm/preview/icons/icon-envelope-t=
ick-round-orange-animated-no-repeat-v1.gif" alt=3D"" width=3D"46" height=3D=
"29" style=3D"width: 46px; height: 29px;"></a></td><td style=3D"width: 470p=
x; padding-top: 12px; color: rgb(65, 66, 78); font-size: 13px; font-family:=
 Arial, Helvetica, sans-serif; line-height: 18px;">V=C3=ADrusmentes.<a href=
=3D"https://www.avast.com/sig-email?utm_medium=3Demail&amp;utm_source=3Dlin=
k&amp;utm_campaign=3Dsig-email&amp;utm_content=3Demailclient" target=3D"_bl=
ank" style=3D"color: rgb(68, 83, 234); text-decoration: underline;">www.ava=
st.com</a></td></tr></tbody></table></div></div><br></div></body></html>
--Apple-Mail=_DDD745D3-F878-45DB-B600-6A69B626C491--