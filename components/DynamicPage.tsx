"use client";
import { useState, useEffect } from "react";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import PolicyLayout, { Section } from "@/components/PolicyLayout";

interface SectionData { id: string; heading: string; body: string; }
interface PageContent { eyebrow: string; title: string; subtitle: string; sections: SectionData[]; }

interface DynamicPageProps {
  slug: string;
  defaults: PageContent;
}

function renderBody(body: string) {
  // Convert markdown-ish to JSX-friendly HTML
  const html = body
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#F0EDE8">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^• (.+)$/gm, '<div style="display:flex;gap:8px;margin-bottom:4px"><span style="color:#C8922A;flex-shrink:0">•</span><span>$1</span></div>')
    .replace(/\n\n/g, '</p><p style="margin-top:10px">')
    .replace(/\n/g, '<br/>');
  return <p style={{ fontSize:13, color:"var(--muted)", lineHeight:1.8, fontWeight:300, margin:0 }} dangerouslySetInnerHTML={{__html:html}}/>;
}

export default function DynamicPage({ slug, defaults }: DynamicPageProps) {
  const [content, setContent] = useState<PageContent>(defaults);

  useEffect(() => {
    fetch(`/api/pages?slug=${slug}`, { cache:"no-store" })
      .then(r => r.json())
      .then(d => { if (d.content) setContent({ ...defaults, ...d.content }); })
      .catch(() => {});
  }, [slug]);

  return (
    <>
      <Masthead />
      <main style={{ background: "var(--bg)", minHeight: "80vh" }}>
        <PolicyLayout eyebrow={content.eyebrow} title={content.title} subtitle={content.subtitle}>
          {content.sections.map(s => (
            <Section key={s.id} title={s.heading}>
              {renderBody(s.body)}
            </Section>
          ))}
        </PolicyLayout>
      </main>
      <Footer />
    </>
  );
}
