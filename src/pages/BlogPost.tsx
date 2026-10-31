import { Link, useParams } from "react-router-dom";
import { ArrowRight, Clock, Tag, Calendar } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { blogPosts, findBlogPost } from "@/data/blog";
import { useSeo } from "@/lib/seo";
import { blogTopicFor } from "@/data/blogTopics";

const BlogPost = () => {
  const { slug } = useParams();
  const post = findBlogPost(slug);

  useSeo(post ? {
    title: post.metaTitle,
    description: post.metaDescription,
    keywords: post.keywords,
    path: `/blog/${post.slug}`,
    type: "article",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` },
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `https://www.digiformation.co.uk/blog/${post.slug}#article`,
      headline: post.title,
      description: post.metaDescription,
      datePublished: post.date,
      dateModified: post.dateModified ?? post.date,
      author: { "@id": "https://www.digiformation.co.uk/#organization" },
      publisher: { "@id": "https://www.digiformation.co.uk/#organization" },
      image: "https://www.digiformation.co.uk/favicon-512.png",
      mainEntityOfPage: `https://www.digiformation.co.uk/blog/${post.slug}`,
      keywords: post.keywords,
      articleSection: post.category,
    },
  } : {
    title: "Article not found — Digiformation Ltd",
    description: "The requested article could not be found. Browse the DigiFormation blog for current guides.",
    path: `/blog/${slug ?? ""}`,
    noindex: true,
  }, [post?.slug, slug]);

  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-5xl font-bold">Article not found</h1>
          <Link to="/blog" className="inline-block mt-8 px-6 py-3 rounded-full bg-gradient-brand">Back to Blog</Link>
        </div>
      </Layout>
    );
  }

  const topic = blogTopicFor(post);
  const related = blogPosts.filter((p) => p.slug !== post.slug && blogTopicFor(p).id === topic.id).slice(0, 3);

  return (
    <Layout>
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />
        <div className="container mx-auto px-4 py-12 md:py-16 relative">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.14em] opacity-90 mb-5">
              <Link to="/blog" className="inline-flex items-center gap-1 hover:text-primary">← Blog</Link>
              <span className="inline-flex items-center gap-1"><Tag className="w-3 h-3" /> {post.category}</span>
              <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
              <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight">
              {post.title}
            </h1>
            <p className="mt-6 text-lg md:text-xl leading-relaxed opacity-90">{post.excerpt}</p>
            <p className="mt-4 text-sm opacity-80">
              Published by <Link to="/about" className="underline underline-offset-4">Digiformation Ltd</Link>
              {post.dateModified && post.dateModified !== post.date && <> · Updated <time dateTime={post.dateModified}>{post.dateModified}</time></>}
            </p>
          </div>
        </div>
      </section>

      <article className="py-14">
        <div className="container mx-auto px-4 max-w-3xl space-y-8">
          <p className="text-sm opacity-80">
            General information; individual legal, tax and provider requirements need review for your circumstances. <Link to="/contact" className="underline underline-offset-4">Report an issue or ask about this article</Link>.
          </p>
          {post.content && post.content.length > 0 ? (
            post.content.map((s) => (
              <section key={s.h}>
                <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-4">{s.h}</h2>
                <div
                  className="opacity-90 leading-relaxed prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: s.body }}
                />
              </section>
            ))
          ) : (
            <div className="glass glass-tint-pink rounded-2xl p-10 text-center">
              <h2 className="font-display text-2xl font-bold mb-3">Full article coming soon</h2>
              <p className="opacity-80">
                We're publishing the in-depth version of this guide shortly. In the meantime,
                speak with our specialists on WhatsApp for a personalised walkthrough.
              </p>
              <Button asChild variant="hero" className="rounded-full mt-6">
                <Link to="/contact">Talk to a Specialist <ArrowRight className="w-4 h-4" /></Link>
              </Button>
            </div>
          )}

          <section aria-labelledby="topic-services-heading" className="glass glass-tint-pink rounded-2xl p-8 mt-6">
            <h2 id="topic-services-heading" className="font-display text-xl font-semibold mb-4">Explore {topic.title.toLowerCase()}</h2>
            <ul className="space-y-2 text-sm">
              {topic.links.map((link) => <li key={link.path}><Link to={link.path} className="text-primary hover:underline">→ {link.label}</Link></li>)}
              <li><Link to="/contact" className="text-primary hover:underline">Discuss this guide with DigiFormation</Link></li>
            </ul>
          </section>
        </div>
      </article>

      {related.length > 0 && (
        <section className="py-10 border-t border-border/60">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Related articles</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((p) => (
                <Link key={p.slug} to={`/blog/${p.slug}`} className="glass glass-tint-pink rounded-2xl p-6 hover:-translate-y-1 transition-all">
                  <div className="text-[10px] uppercase tracking-[0.14em] opacity-80 mb-2">{p.category}</div>
                  <h3 className="font-semibold text-base leading-snug">{p.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default BlogPost;
