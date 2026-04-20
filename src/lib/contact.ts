import resume from '$lib/data/resume.json';

const { name, email, url, location, profiles, label } = resume.basics;
const nameParts = name.split(' ');
const firstName = nameParts.slice(0, -1).join(' ');
const lastName = nameParts[nameParts.length - 1];

const extraEmails = profiles
	.filter(p => p.url.startsWith('mailto:'))
	.map(p => p.url.slice('mailto:'.length));

const socialProfiles = profiles.filter(p => !p.url.startsWith('mailto:'));

function foldLine(line: string): string {
	if (line.length <= 75) return line;
	const chunks: string[] = [line.slice(0, 75)];
	let i = 75;
	while (i < line.length) {
		chunks.push(' ' + line.slice(i, i + 74));
		i += 74;
	}
	return chunks.join('\r\n');
}

export function generateVCard(): string {
	const lines = [
		'BEGIN:VCARD',
		'VERSION:3.0',
		`FN:${name}`,
		`N:${lastName};${firstName};;;`,
		`TITLE:${label}`,
		`EMAIL;TYPE=INTERNET,PREF:${email}`,
		...extraEmails.map(e => `EMAIL;TYPE=INTERNET:${e}`),
		`URL:${url}`,
		`PHOTO;VALUE=URL:${url}/images/profile_thumb.jpg`,
		`ADR;TYPE=HOME:;;;${location.city};${location.region};${location.countryCode}`,
		...socialProfiles.map(
			p => `X-SOCIALPROFILE;TYPE=${p.network.toLowerCase().replace(/\s+/g, '-')}:${p.url}`
		),
		'END:VCARD',
	];
	return lines.map(foldLine).join('\r\n');
}

export function generateJCard(): string {
	const properties: unknown[] = [
		['version', {}, 'text', '4.0'],
		['fn', {}, 'text', name],
		['n', {}, 'text', [lastName, firstName, '', '', '']],
		['title', {}, 'text', label],
		['email', { type: ['internet', 'pref'] }, 'text', email],
		...extraEmails.map(e => ['email', { type: ['internet'] }, 'text', e]),
		['url', {}, 'uri', url],
		['adr', { type: ['home'] }, 'text', ['', '', '', location.city, location.region, '', location.countryCode]],
		...socialProfiles.map(p => [
			'url',
			{ type: [p.network.toLowerCase().replace(/\s+/g, '-')] },
			'uri',
			p.url,
		]),
	];
	return JSON.stringify(['vcard', properties], null, 2);
}

function escapeMeCard(s: string): string {
	return s.replace(/[\\;,:]/g, c => '\\' + c);
}

export function generateMeCard(): string {
	const fields = [
		`N:${escapeMeCard(lastName)},${escapeMeCard(firstName)}`,
		`EMAIL:${escapeMeCard(email)}`,
		...extraEmails.map(e => `EMAIL:${escapeMeCard(e)}`),
		`URL:${escapeMeCard(url)}`,
		`ADR:,,,${escapeMeCard(location.city)},${escapeMeCard(location.region)},${escapeMeCard(location.countryCode)}`,
	];
	return 'MECARD:' + fields.join(';') + ';;';
}

function escapeHtml(s: string): string {
	return s.replace(
		/[&<>"']/g,
		c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c)
	);
}

export function generateHCard(): string {
	const allEmails = [email, ...extraEmails];
	return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(name)}</title>
  <link rel="canonical" href="${escapeHtml(url)}">
</head>
<body>

<!-- Microformats2 h-card -->
<div class="h-card">
  <span class="p-name">${escapeHtml(name)}</span>
  <span class="p-job-title">${escapeHtml(label)}</span>
  <img class="u-photo" src="${escapeHtml(url)}/images/profile_thumb.jpg" alt="${escapeHtml(name)}">
${allEmails.map(e => `  <a class="u-email" href="mailto:${escapeHtml(e)}">${escapeHtml(e)}</a>`).join('\n')}
  <a class="u-url" href="${escapeHtml(url)}">${escapeHtml(url)}</a>
  <div class="p-adr h-adr">
    <span class="p-locality">${escapeHtml(location.city)}</span>,
    <span class="p-region">${escapeHtml(location.region)}</span>,
    <span class="p-country-name">${escapeHtml(location.countryCode)}</span>
  </div>
${socialProfiles.map(p => `  <a class="u-url" rel="me" href="${escapeHtml(p.url)}">${escapeHtml(p.network)}</a>`).join('\n')}
</div>

<!-- Microformats1 hCard -->
<div class="vcard">
  <span class="fn">${escapeHtml(name)}</span>
  <span class="title">${escapeHtml(label)}</span>
  <img class="photo" src="${escapeHtml(url)}/images/profile_thumb.jpg" alt="${escapeHtml(name)}">
${allEmails.map(e => `  <a class="email" href="mailto:${escapeHtml(e)}">${escapeHtml(e)}</a>`).join('\n')}
  <a class="url" href="${escapeHtml(url)}">${escapeHtml(url)}</a>
  <div class="adr">
    <span class="locality">${escapeHtml(location.city)}</span>,
    <span class="region">${escapeHtml(location.region)}</span>,
    <span class="country-name">${escapeHtml(location.countryCode)}</span>
  </div>
${socialProfiles.map(p => `  <a class="url" rel="me" href="${escapeHtml(p.url)}">${escapeHtml(p.network)}</a>`).join('\n')}
</div>

</body>
</html>`;
}