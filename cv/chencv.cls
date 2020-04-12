\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{chencv}[2016/09/06 Xiang `Anthony' Chen CV Class]
\LoadClass[10pt]{article}

\usepackage{calc} % to allow linewidth in minipage to be an equation
\usepackage{fancyhdr}
\usepackage{fontspec}
\usepackage{anyfontsize}
\usepackage{hyperref}
\usepackage{dirtytalk}
\usepackage{parcolumns}
\usepackage[letterpaper,left=1in,right=0.75in,top=0.75in,bottom=1.7in]{geometry}
\usepackage{color}
\usepackage{setspace}
\usepackage{scrextend}

\definecolor{mygray}{gray}{0.6}
\definecolor{darkgray}{gray}{0.4}

\def\@colwidth1{1in}

\setmainfont [Path=fonts/,
    BoldFont={MinionPro-Bold.otf},
    ItalicFont={MinionPro-It.otf}]{MinionPro-Regular.otf}

%\setmainfont [Path=fonts/,
%    BoldFont={Lora-Bold.ttf},
%    ItalicFont={Lora-Italic.ttf}]{Lora-Regular.ttf}

\RequirePackage{titlesec}

\def\hrulefill{\leavevmode\leaders\hrule height .01cm\hfill\kern\z@}
\def\thinhrulefill{\leavevmode\leaders\hrule height .001cm\hfill\kern\z@}

\titleformat{\section}
    {\bf\raggedright\fontsize{15pt}{15}\selectfont}
    {\vspace{24pt}}{\@colwidth1}
    {}
    [\vspace{-10pt}\hspace{\@colwidth1}\color{black}\hrulefill\vspace{-6pt}]

\titleformat{\subsection}
    {\raggedright\fontsize{12pt}{12}\selectfont}
    {}{\@colwidth1}
    {}
    [\vspace{-6pt}\hspace{\@colwidth1}\color{darkgray}\vspace{-8pt}]

\newcommand*{\name}[2]{\def\@firstname{#1}\def\@lastname{#2}}
\newcommand*{\department}[1]{\def\@department{#1}}
\newcommand*{\affiliation}[1]{\def\@affiliation{#1}}
\newcommand*{\address}[3]{\def\@addressoffice{#1}\def\@addressstreet{#2}\def\@addresscity{#3}}
\newcommand*{\phone}[1]{\def\@phone{#1}}
\newcommand*{\email}[1]{\def\@email{#1}}
\newcommand*{\homepage}[1]{\def\@homepage{#1}}

\newcommand{\makecvtitle}{
%\hspace*{-\parindent}
%\begin{minipage}[b]{0.60\linewidth}
%\vspace*{36pt}
\hspace*{-\parindent}
\begin{minipage}[b]{1.0\linewidth}
\vspace*{6pt}
\addfontfeature{LetterSpace=-1}
%\hspace{\@colwidth1}{\fontsize{20}{24}\selectfont{}\bfseries \@firstname{}\ \@lastname{}}\par
\hspace{\@colwidth1}{\fontsize{16}{24}\selectfont{}\bfseries \@firstname{}\ \@lastname{}} \hspace{0.1in} {\fontsize{16}{16}\selectfont{} Curricumlum Vit\ae} \par
\vspace*{12pt}
\end{minipage}

\hspace*{-\parindent}
\begin{minipage}[b]{0.60\linewidth}
\addfontfeature{LetterSpace=0.0}
%\hspace{\@colwidth1}\textbf{\@department}\par
%\hspace{\@colwidth1}\textbf{\@affiliation}\par
\hspace{\@colwidth1}\@addressoffice\par
\hspace{\@colwidth1}\@addressstreet\par
\hspace{\@colwidth1}\@addresscity
\end{minipage}
\hfill
\begin{minipage}[b]{0.40\linewidth}
\raggedleft
\href{\@homepage}{\@homepage}\par
\@phone\par
\href{mailto:\@email}{\@email}
\end{minipage}
}

\def\@separation{.25cm}

\newcommand{\cvitem}[2]{\vspace{.08in}\noindent\begin{minipage}[t]{\@colwidth1-\@separation}
\raggedleft
\textit{\trim{#1}}\end{minipage}\hspace{\@separation}\begin{minipage}[t]{\linewidth-\@colwidth1}
\trim{#2}
\end{minipage}\vspace{.05in}}

% added by xac
\newcommand{\cvstatement}[1]{
\hspace{\@colwidth1}\begin{minipage}[t]{\linewidth-\@colwidth1}
\trim{#1}
\end{minipage}\vspace{.05in}}


\newcommand{\cvplace}[2]{\textbf{\trim{#1}}\\
\trim{#2}}

\newcommand{\cvtimeloc}[2]{
\trim{#1}\\
\trim{#2}
}

\newcommand{\present}{present}

\newcommand{\cvtimerange}[2]{\trim{#1}\ \textendash{}\ \trim{#2}}
\def\trim#1{\ignorespaces#1\unskip}

\newcommand{\cvpress}[3]{\href{\trim{#3}}{\say{\trim{#1}.} \trim{#2}}}
\newcommand{\cvaward}[1]{{\textsc #1}}

\pagestyle{fancy}
\fancyhf{}% to clear existing header/footer if you don't want it
\renewcommand\headrulewidth{0pt}
\cfoot{\raggedleft{}\textcolor{mygray}{\textbf{\@firstname{}\ \@lastname{}}\  \textemdash{}\ \textit{curriculum\ vit\ae}, page \thepage{}}}

\linespread{0.9}
%\usepackage{showframe}

%\newcommand{\newfontfamily{\FA}{FontAwesome Regular}}

\newcommand{\best}[1]
{{\bfseries \color{blue} {\sc #1}}}