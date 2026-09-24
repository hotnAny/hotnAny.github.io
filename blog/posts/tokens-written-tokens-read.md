# Tokens Written, Tokens Read

Language models have made tokens extremely cheap. An email, a blog post, a poem, a screenplay, even a whole book can now be generated in seconds. At Google I/O in May 2026, Google said it was processing [over 3.2 quadrillion tokens a month](https://blog.google/innovation-and-ai/sundar-pichai-io-2026/), seven times more than a year earlier.

I suspect that a large portion of those tokens are never read by a fellow human.

This stands in stark contrast to classic literature and music, where a single piece, a small set of tokens, has been read, played, and listened to many, many times across generations. This post tries to put rough numbers on that contrast.

---

## Twenty Characters

Consider this Tang poem, *寻隐者不遇* (*Seeking the Recluse, Not Finding Him*):

<p style="padding-left:2em; font-size:1.1em; letter-spacing:0.1em;">松下问童子，言师采药去。<br>只在此山中，云深不知处。</p>

<p style="padding-left:2em; font-style:italic;">Beneath the pines I asked the boy.<br>He said his master's gone for herbs,<br>somewhere on this very mountain,<br>but the clouds are too deep to know where.</p>

It is usually attributed to 贾岛 (Jia Dao), although a Song-dynasty anthology, 《文苑英华》, credits it to [孙革 under a different title](https://zhuanlan.zhihu.com/p/491148066). Either way, it is one of the best-known poems in Chinese. It is in *Three Hundred Tang Poems* and in primary-school textbooks, and generations of children have recited it.

It contains only 20 characters. That comes to 20 tokens under GPT-4o's tokenizer.

Those 20 characters paint a rich image in the reader's mind. I often picture a three-dimensional 水墨画 (ink-wash painting): pine trees, clouds, the poet and the child in the foreground, and the reclusive master somewhere in the background, deep in the woods, hidden by trees and clouds, never seen.

By my rough estimate, the poem has been read or recited on the order of **ten billion times**.

---

## A Unit: Token-Reads

To compare a 20-character poem with a 1,000-token email, I use a simple unit:

**token-reads = tokens authored × the number of times a human has read them**

I first called this "token impressions", borrowing from web analytics. But in advertising, an [impression](https://en.wikipedia.org/wiki/Impression_(online_media)) is counted when content is *served*, whether or not anyone sees it, let alone reads it. That is exactly the gap I want to measure, so "reads" is the better word.

Token-reads divided by tokens gives the number of times each token has been read. On a log-log plot, works with the same read count fall on the same diagonal line. That makes it easy to put a poem and a novel on one chart.

---

## The Chart

<iframe src="assets/token-reads/chart.html" title="Log-log scatter of tokens authored versus lifetime token-reads for pre-LLM and AI-generated works" loading="lazy" style="width:100%; aspect-ratio: 960 / 680; min-height: 380px; border: 0;"></iframe>

*Hover over a dot for its estimate and source. Filled blue dots are canonical pre-LLM works. Hollow blue dots are typical pre-LLM works. Orange dots are everyday AI output. Whiskers show low–high estimates. The data, sources, and method are in the appendix below.*

The canonical works cluster at the top. The Bible, *Harry Potter*, *Hamlet*, a Bach prelude, "Happy Birthday", and the twenty-character poem all sit between the "read 1M×" and "read 1T×" lines. AI output sits between the "read 0.01×" and "read 1K×" lines: emails, chatbot answers, LinkedIn posts, SEO blog posts, Kindle books. The two groups are **6 to 12 orders of magnitude apart**.

The lowest dot is the reasoning trace, the chain of thought a model writes before answering. It is hidden or summarized by default. Those tokens are written specifically not to be read.

---

## But That Comparison Is Unfair

When I first sketched this, I compared the *best* of the past with the *median* of the present. That comparison is rigged. Most writing from before language models was never read much either. The [《全唐诗》](https://baike.baidu.com/item/%E5%85%A8%E5%94%90%E8%AF%97/498420) collects about 48,900 Tang poems, and most of them never made it into an anthology or a textbook. The typical 19th-century novel had a print run of a thousand copies or fewer, and Franco Moretti called that forgotten majority ["the great unread"](https://en.wikipedia.org/wiki/Distant_reading). Even Bach was largely neglected for about 80 years after his death, until [Mendelssohn revived the *St Matthew Passion* in 1829](https://www.classical-music.com/features/composers/how-mendelssohn-helped-bring-bachs-st-matthew-passion-back-to-life).

So the chart also includes typical pre-LLM works, drawn as hollow dots. With those, the picture changes:

- A personal letter reaches about as many readers as an AI-drafted email. Both have roughly one reader.
- A typical Tang poem sits about two orders of magnitude above an AI-written post on X.
- A typical novel sits about 3.5 orders of magnitude above an AI-generated Kindle book, and a typical newspaper article about 3.5 orders above an AI SEO blog post.

The gap is real, but most of the dramatic 6-to-12-order gap comes from the canon. A fairer claim: **ordinary pre-LLM writing was already read far less than we imagine, and ordinary AI writing is read even less.**

---

## Why the Gap?

Two things seem to be going on.

**Authorship used to be a filter.** Writing a novel took a year. Printing it cost money, and so did distributing it. By the time a text reached a reader, several people had already bet that it was worth reading. That cost is now close to zero, so nothing filters the text before it reaches a reader.

**Attention is fixed while supply is not.** Humans read at roughly the same speed they always have, and there are only so many hours in a day. When the supply of tokens grows sevenfold in a year, the reads per token must fall. Social-media data already shows this pressure. By one estimate, a post gets half of its lifetime engagement within [52 minutes on X, and within about a day on Instagram and LinkedIn](https://www.scottgraffius.com/blog/files/lifespan-halflife-of-social-media-posts-update-2026.html). On the web, [96.55% of pages](https://ahrefs.com/blog/search-traffic-study/) get no traffic from Google at all.

One caveat. Many AI tokens are addressed to machines, not people: tool calls, agent-to-agent messages, code, reasoning. "Never read by a human" is not a failure for those tokens. This argument is about tokens *meant* for human readers.

---

## So What?

Creating art used to be arduous. The result was a small number of tokens, and the successful ones made a long-lasting impression. Now creation is cheap and easy. The result is a virtually unlimited supply of tokens, and few of them will be read by anyone at all, let alone for long.

I don't think the lesson is to stop generating. But when I write, I now ask a different question. Not "how quickly can I produce this?" but "how many times will each of these tokens be read?" Twenty characters under a pine tree have been read ten billion times. It is worth asking what it would take to write something that is read even twice.

---

## Appendix: Research Method

**Scope.** Each dot is one work. For pre-LLM works, I picked canonical examples across forms (a poem, a song, a piece of music, a play, novels, scripture) and typical examples of the same forms (a letter, a median Tang poem, a median 19th-century novel, a newspaper article). For AI output, I picked things people commonly generate with language models today: emails, chatbot answers, reasoning traces, posts on X and LinkedIn, SEO blog posts, and self-published Kindle books.

**Tokens.** I counted tokens with OpenAI's `o200k_base` tokenizer (the GPT-4o family) through `tiktoken`. Claude's tokenizer is not public.

- For *Hamlet*, *Pride and Prejudice*, and the King James Bible, I tokenized the full [Project Gutenberg](https://www.gutenberg.org/) texts (#1524, #1342, and #10). They came to 47,663, 170,260, and 1,144,344 tokens.
- English prose averaged about 1.34 tokens per word. I used that ratio for works I didn't tokenize directly, such as *Harry Potter* (76,944 words).
- The poem is 20 tokens, or 24 with punctuation. Under the older GPT-4 tokenizer (`cl100k_base`), it is 27.
- Bach's prelude has no text, so I counted note events instead: about 42 bars of 16 sixteenth notes, or 672 notes.
- For AI output, I assumed typical lengths, e.g. about 150 words for an email and about 1,400 for an SEO blog post.

**Reads.** A "read" is one full reading, listening, or viewing by a human, or its equivalent in partial reads. Each estimate has a low, mid, and high value. The dot is at the mid value, and the whisker spans low to high. Most of these are **order-of-magnitude estimates**.

<div style="overflow-x:auto"><table style="border-collapse:collapse; font-size:0.8rem; line-height:140%;">
<thead><tr><th style="text-align:left; padding:4px 8px; border-bottom:1px solid #ccc;">Work</th><th style="text-align:left; padding:4px 8px; border-bottom:1px solid #ccc;">Tokens</th><th style="text-align:left; padding:4px 8px; border-bottom:1px solid #ccc;">Reads (low / mid / high)</th><th style="text-align:left; padding:4px 8px; border-bottom:1px solid #ccc;">Basis</th></tr></thead>
<tbody>
<tr><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;">寻隐者不遇</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">20</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">1B / 10B / 50B</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;">~700M pupils since it entered textbooks × ~15 recitations, plus pre-modern readers</td></tr>
<tr><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;">Happy Birthday to You</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">20</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">100B / 500B / 2T</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;"><a href="https://en.wikipedia.org/wiki/Happy_Birthday_to_You">Most recognized English song</a>; ~1B sung birthdays/yr × ~100 yrs × a few listeners. Speculative</td></tr>
<tr><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;">Bach Cello Suite No. 1, Prelude</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">672 notes</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">500M / 2B / 10B</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;">Yo-Yo Ma's recording alone has <a href="https://routenote.com/blog/most-famous-classical-music-pieces-on-spotify-today/">~411M Spotify streams</a>; scaled up for other recordings, platforms, and live performance</td></tr>
<tr><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;">Hamlet</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">47,663</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">100M / 300M / 1B</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;">School reading, performance, and adaptation over 400 years</td></tr>
<tr><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;">Pride and Prejudice</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">170,260</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">20M / 60M / 200M</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;"><a href="https://janeaustens.house/online-exhibition/the-making-of-pride-and-prejudice/the-making-of-pride-and-prejudice-10/">>20M copies</a> × ~3 readers per copy</td></tr>
<tr><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;">Harry Potter and the Philosopher's Stone</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">103,105</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">120M / 240M / 500M</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;"><a href="https://en.wikipedia.org/wiki/Harry_Potter_and_the_Philosopher%27s_Stone">~120M copies</a> × ~2 readers per copy</td></tr>
<tr><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;">Bible (KJV)</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">1,144,344</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">100M / 500M / 2B</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;"><a href="https://www.guinnessworldrecords.com/world-records/best-selling-book-of-non-fiction">5–7B copies printed</a>, counted as full-read equivalents assuming a few percent of each copy is read</td></tr>
<tr><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;">Personal letter (typical)</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">400</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">1 / 2 / 5</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;">The recipient, plus a re-read or two</td></tr>
<tr><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;">Tang poem (typical)</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">40</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">100 / 1K / 10K</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;">Median of ~48,900 poems in 《全唐诗》, mostly outside anthologies. Speculative</td></tr>
<tr><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;">19th-c. novel (typical)</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">230,000</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">500 / 5K / 20K</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;">Print runs ≤1,000, read through circulating libraries (~5–10 readers per copy)</td></tr>
<tr><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;">Newspaper article (typical)</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">1,070</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">1K / 15K / 100K</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;">30K circulation × <a href="https://onepressne.com/insights/understanding-news-media-circulation-vs-readership-why-it-matters">~2.5 readers per copy</a> × ~20% who read a given article</td></tr>
<tr><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;">AI-drafted email</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">200</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">0.2 / 0.7 / 1</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;">One recipient; <a href="https://blog.hubspot.com/sales/average-email-open-rate-benchmark">~43% average marketing open rate</a></td></tr>
<tr><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;">Chatbot answer</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">400</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">0.1 / 0.5 / 1</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;">Read at most once by the person who asked, often skimmed; ChatGPT handles <a href="https://techcrunch.com/2025/07/21/chatgpt-users-send-2-5-billion-prompts-a-day/">~2.5B prompts a day</a></td></tr>
<tr><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;">Reasoning trace</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">2,000</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">0.001 / 0.01 / 0.05</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;">Hidden or summarized by default</td></tr>
<tr><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;">AI-written X post</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">40</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">5 / 20 / 60</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;">Free accounts reportedly get ~60 impressions per post, a tenth of Premium's ~600 (industry estimate); impressions overstate reads</td></tr>
<tr><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;">AI-written LinkedIn post</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">260</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">30 / 150 / 840</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;"><a href="https://authoredup.com/blog/linkedin-impressions-vs-views">Median 840 impressions</a>; assumes ~20% of impressions are reads. <a href="https://www.pangram.com/blog/ai-in-your-feed">~41% of long LinkedIn posts are AI-generated</a></td></tr>
<tr><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;">AI SEO blog post</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">1,800</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">0.1 / 3 / 50</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;"><a href="https://ahrefs.com/blog/search-traffic-study/">96.55% of pages get no Google traffic</a></td></tr>
<tr><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;">AI-generated Kindle book</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">40,000</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top; white-space:nowrap;">1 / 10 / 200</td><td style="padding:4px 8px; border-bottom:1px solid #eee; vertical-align:top;">AI-heavy titles are 20% of the catalogue but 12% of sales (<a href="https://arxiv.org/abs/2607.20349">arXiv 2607.20349</a>); per-title median not reported</td></tr>
</tbody></table></div>

The full dataset is in [token-reads.csv](assets/token-reads/token-reads.csv).

**Limitations.**

- Most read counts are estimates built from proxies (copies sold, streams, impressions), not measured reads. Copies overstate reads for the Bible and understate them for library books. Platform impressions overstate reads for social posts.
- The canonical works were chosen *because* they are widely read, which is why the chart also includes typical works.
- A token in a poem and a token in an email are counted the same, although the poem's tokens carry far more. That idea, something like *evocative density*, is a separate argument and not part of this chart.
- Token counts depend on the tokenizer. Chinese text in particular can come out 30–40% larger under older tokenizers.
