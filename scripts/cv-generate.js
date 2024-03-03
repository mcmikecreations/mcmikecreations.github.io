import resume from '../src/lib/data/resume.json' assert { type: "json" };
import { writeFile } from 'fs';

const filePath = '../static/cv.tex';
const content = buildHeader() + buildHero() + buildSummary() + buildWork() + buildEducation() + buildPublications() + buildCertificatesAwards() + buildFooter();

writeFile(filePath, content, err => {
	if (err) {
		console.error(err);
	} else {
		console.log('Wrote content to ' + filePath);
	}
});

function buildHero() {
	return `
% -------------------------------------
%----------HEADING---------------------
% -------------------------------------

\\begin{flushleft}
    \\textbf{\\large ${resume.basics.name}, ${resume.basics.label}} \\\\    
    \\textit{${resume.basics.location.city}, ${resume.basics.location.region}, ${resume.basics.location.countryCode}} $|$ 
${resume.basics.profiles.map((x) => '    \\href{' + x.url + '}{{\\textit{@' + x.network + '}}}').join(' $|$\n')}
    \\vspace{-8pt}
\\end{flushleft}
	`;
}

function buildSummary() {
	return `
% -------------------------------------
%---------- PROFESSIONAL SUMMARY ------
% -------------------------------------

\\section{Professional Summary}
\\vspace{-3pt}
\\begin{itemize}[leftmargin=0.15in, label={}]
    {\\item{
     {${resume.basics.summary}} \\\\      
    }}
 \\end{itemize}
 \\sectionspace
	`;
}

function buildWork() {
	const items = resume.work.map((w) => {
		const desc = `
        \\resumeItem{${w.summary}}
        \\resumeItem{${w.description}}
        \\resumeItem{${w.highlights.join(', ')}}
		`;
		return `
      \\resumeProjectHeading
           {\\titleItem{{${w.position}}} $|$ \\href{${w.url}}{{\\emph{${w.name}, ${w.location}}}}}{${w.startDate} -- ${w.endDate ?? 'Present'}}
      \\resumeItemListStart
${desc}
      \\resumeItemListEnd
		`;
	});
	return `
% -------------------------------------
%----------EXPERIENCE------------------
% -------------------------------------

\\section{Experience}
  \\resumeSubHeadingListStart
${items.join('')}
  \\resumeSubHeadingListEnd
	`;
}

function buildEducation() {
	const items = resume.education.map((w) => {
		return `
    \\resumeSubheading
      {${w.studyType} in ${w.area}}{GPA : ${w.score ?? 'TBA'}}
      {\\href{${w.url}}{{${w.institution}}} | ${w.location}}{${w.startDate} -- ${w.endDate ?? 'Present'}} 
      {${w.description ?? ''}}
		`;
	});
	return `
% -------------------------------------
%----------EDUCATION-------------------
% -------------------------------------

\\section{Education}
  \\resumeSubHeadingListStart
${items.join('')}
  \\resumeSubHeadingListEnd
\\vspace{-8pt}
	`;
}

function buildPublications() {
	const items = resume.publications.map((w) => {
		return `
    \\resumePublicationHeading
      {${w.name + ' ' + w.publisher + ', ' + new Date(w.releaseDate).toLocaleDateString('en-us', { year:"numeric", month:"short" }) + ', '}}
      {${w.summary}} 
      {${w.url ?? ''}}
		`;
	});
	return `
% -------------------------------------
%----------PUBLICATIONS----------------
% -------------------------------------

\\section{Publications}
  \\resumeSubHeadingNumberedListStart
${items.join('')}
  \\resumeSubHeadingNumberedListEnd
\\vspace{-8pt}
	`;
}

function buildCertificatesAwards() {
	const itemsCertificates = resume.certificates.map((w) => {
		return `
    \\item
			\\titleItem{${w.url ? '\\href{' + w.url + '}{{' + w.name + '}}' : w.name}}, \\emph{${w.issuer}}, ${new Date(w.date).toLocaleDateString('en-us', { year:"numeric", month:"short" })}
			\\vspace{-9pt}
		`;
	});
	const itemsAwards = resume.awards.map((w) => {
		return `
    \\item
			\\titleItem{${w.title}}, \\emph{${w.awarder}}, {${w.summary}}, ${new Date(w.date).toLocaleDateString('en-us', { year:"numeric", month:"short" })}
			\\vspace{-9pt}
		`;
	});
	return `
% -------------------------------------
%-----------AWARDS---------------------
% -------------------------------------

\\section{Awards and Certifications}
    \\subheadingtitlevspace\\begin{itemize}[leftmargin=0.15in, label={}]
${itemsCertificates.join('')}
\\par\\hrulefill
${itemsAwards.join('')}
    \\end{itemize}
	`;
}

function buildHeader() {
	return `
%------------------------------------------------------------------------------
%------------------------------------------------------------------------------
%------------------------------------------------------------------------------
% Resume in Latex
% Author : Shubham Mazumder
% Owner : ${resume.basics.name}
% Based off of: https://github.com/sb2nov/resume
% License : MIT
%------------------------------------------------------------------------------
%------------------------------------------------------------------------------
%------------------------------------------------------------------------------

\\documentclass[letterpaper,10pt]{article}
\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{amsmath}
\\usepackage{soul}
%\\input{glyphtounicode}
\\usepackage[margin=0.5in]{geometry}

%----------FONT OPTIONS----------
% Sans-serif Fonts
% \\usepackage[sfdefault]{FiraSans}
% \\usepackage[sfdefault,light]{inter}
% \\usepackage[sfdefault]{noto-sans}
% \\usepackage{roboto}
% \\usepackage[sfdefault,medium]{InriaSans}
\\usepackage[default]{sourcesanspro}

% Serif Fonts
% \\usepackage{CormorantGaramond}
% \\usepackage{charter}


% -------------------------------------
%----------PAGE SETUP------------------
% -------------------------------------


\\pagestyle{fancy}
\\fancyhf{} % clear all header and footer fields
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
% \\addtolength{\\oddsidemargin}{0.5pt}
% \\addtolength{\\evensidemargin}{0.5pt}
% \\addtolength{\\textwidth}{0.9in}
% \\addtolength{\\topmargin}{-0.6in}
% \\addtolength{\\textheight}{1.6in}

% \\addtolength{\\oddsidemargin}{-.875in}
% \\addtolength{\\evensidemargin}{-.875in}
% \\addtolength{\\textwidth}{1.75in}
% \\addtolength{\\topmargin}{-.875in}
% \\addtolength{\\textheight}{1.75in}

% URL style
\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}
\\setlength{\\footskip}{3.60004pt}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-5pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-4pt}]

% Ensure that generate pdf is machine readable/ATS parsable
%\\pdfgentounicode=1

% ----------- Definitions -----------------------
\\def\\spaceforrole{ }
\\definecolor{lightyellow}{cmyk}{0.00, 0.05, 0.20, 0.00} % Highlights
\\sethlcolor{lightyellow} % Highlights

%--------------- Custom commands -----------------------

\\newcommand{\\sectionspace}{
\\vspace{-20pt}
}

\\newcommand{\\subheadingtitlevspace}{
\\vspace{-3pt}
}


% Resume Item
\\newcommand{\\resumeItem}[1]{
  \\item{
    {#1 \\vspace{-4pt}}
  }
}

% Titles
\\newcommand{\\titleItem}[1]{
  % \\textsl{\\textbf{#1}}
  \\textbf{#1}
}


% Highlighting
\\newcommand{\\highlight}[1]{
  \\textsl{\\textbf{#1}}
  % \\hl{\\textsl{\\textbf{#1}}}
  % \\textbf{#1}
  % \\textsl{\\hl{#1}}
}

% Resume Subheading
\\newcommand{\\resumeSubheading}[5]{
  \\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{#3} & \\textit{#4} \\\\
      \\multicolumn{2}{c}{\\parbox{\\linewidth}{#5}} \\\\\\vspace{-2pt}
    \\end{tabular*}\\vspace{-8pt}
}



% Resume Sub-sub heading
\\newcommand{\\resumeSubSubheading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textit{#1} & \\textit{#2} \\\\
    \\end{tabular*}\\vspace{-2pt}
}

% Resume Project Heading
\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\parbox{0.85\\linewidth}{#1} & \\textit{ #2} \\\\
    \\end{tabular*}\\vspace{-9pt}
}

% Resume Publication Heading
\\newcommand{\\resumePublicationHeading}[3]{
    \\item #1\\href{#3}{{#2}} \\vspace{-9pt}
}

%Resume Subheading List
\\newcommand{\\resumeSubHeadingListStart}{\\subheadingtitlevspace\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeSubHeadingNumberedListStart}{\\subheadingtitlevspace\\begin{enumerate}[leftmargin=0.15in]}
\\newcommand{\\resumeSubHeadingNumberedListEnd}{\\end{enumerate}}

%Resume Item List
\\newcommand{\\resumeItemListStart}{
% \\vspace{-1pt}
\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{
% \\vspace{-6pt}
\\end{itemize}\\vspace{-8pt}}

%-------------------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%
%-------------------------------------------------------

\\begin{document}
	`;
}

function buildFooter() {
	return `

%-------------------------------------------
\\end{document}

	`;
}
