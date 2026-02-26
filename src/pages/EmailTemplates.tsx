import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function EmailTemplates() {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const templates = [
        {
            id: 'igoaimalathane-disiplini',
            title: 'Dijitalde "igoaimalathane" Disiplini: Teknoloji ve Yaratıcılığın Dengesi',
            subject: 'Dijitalde "igoaimalathane" Disiplini',
            content: `Dijital dünyanın hızı ve dinamikleri her gün değişirken, biz igoaimalathane olarak değişmeyen bir prensiple üretim yapmaya devam ediyoruz: Zanaatkar titizliği ve modern teknoloji.

Bir web projesinin sadece kodlardan değil, markanın ruhunu taşıyan bir vizyondan oluştuğuna inanıyoruz. Bu yüzden ödüllü projelerimizde yapay zekanın sunduğu hızı ve verimliliği sonuna kadar kullanırken, stratejinin merkezine her zaman insan yaratıcılığını ve sezgisini koyuyoruz. Teknolojiyi bir amaç değil, hayal ettiğimiz o kusursuz kullanıcı deneyimine ulaşmak için bir araç olarak görüyoruz.

Neden igoaimalathane ile çalışmalısınız?
Sürdürülebilir Üretim: Projelerimizi sadece teslim etmiyor, onların dijital dünyadaki yaşam döngüsü boyunca yanınızda duruyoruz.
Hibrit Yaklaşım: Yapay zekanın analitik gücüyle insan zihninin estetik dokunuşunu birleştirerek, markanıza özel "terzi dikimi" çözümler üretiyoruz.
Somut Teknoloji: Sadece web sitesi yapmıyoruz, kendi yazılım ekosistemimizi kuran teknik derinliğimizle, markanızın en karmaşık ihtiyaçlarına yanıt veriyoruz.
Eğer dijital projelerinizde istikrar, ulaşılabilirlik ve yenilikçi bir bakış açısı arıyorsanız; gelin, imalathanemizde markanız için neler yapabileceğimizi konuşalım.
Dijitaldeki yeni kalenizi birlikte inşa etmek dileğiyle.

Saygılarımızla,`
        }
    ];

    const copyToClipboard = async (id: string, text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Kopyalama işlemi başarısız oldu:', err);
            alert('Metin kopyalanamadı, lütfen manuel kopyalayın.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold">E-posta Metinleri</h1>
                    <p className="text-slate-500 mt-1">Hazır şablonları kullanarak iletişiminizi hızlandırın.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map(template => (
                    <div key={template.id} className="glass-card flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-start gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white leading-tight">
                                    {template.title}
                                </h3>
                            </div>
                            <button
                                onClick={() => copyToClipboard(template.id, template.content)}
                                className={`flex items-center justify-center p-2 rounded-xl transition-all flex-shrink-0 ${copiedId === template.id
                                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300'
                                    }`}
                                title={copiedId === template.id ? 'Kopyalandı!' : 'Metni Kopyala'}
                            >
                                {copiedId === template.id ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>
                        <div className="p-6 flex-1 bg-white dark:bg-slate-800">
                            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {template.content}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
