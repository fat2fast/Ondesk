import React, { useState, useMemo } from 'react';
import { Mail, Copy, Check, Eye, Code, Smartphone, User, MapPin, Info } from 'lucide-react';
import { Button } from '../ui/Button';

interface SignatureData {
  name: string;
  title: string;
  mobilePhone1: string;
  mobilePhone2: string;
  skype: string;
  hotline: string;
  emailSupport: string;
  logoUrl: string;
  address1: string;
  address2: string;
  website: string;
}

const LOGO_OPTIONS = [
  { id: 'default', label: 'Your company logo', url: 'https://yourcompany.com/logo.png' },
];

// Move these components outside to prevent re-creation on every render (fixes focus loss bug)
const InputGroup = ({ label, icon: Icon, children }: { label: string, icon: any, children?: React.ReactNode }) => (
  <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
    <h3 className="text-slate-200 font-semibold mb-4 flex items-center gap-2">
      <Icon className="w-4 h-4 text-green-500" /> {label}
    </h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const TextField = ({ 
  label, 
  placeholder, 
  required,
  value,
  onChange 
}: { 
  label: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
}) => (
  <div>
    <label className="block text-xs font-medium text-slate-400 mb-1">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500 focus:outline-none"
    />
  </div>
);

export const EmailSignatureGenerator: React.FC = () => {
  const [data, setData] = useState<SignatureData>({
    name: '',
    title: '',
    mobilePhone1: '',
    mobilePhone2: '',
    skype: '',
    hotline: '',
    emailSupport: '',
    logoUrl: LOGO_OPTIONS[0].url,
    address1: 'Your Address Line 1',
    address2: 'Your Address Line 2',
    website: 'yourcompany.com',
  });

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [copied, setCopied] = useState(false);
  const [copiedFormatted, setCopiedFormatted] = useState(false);

  const handleInputChange = (field: keyof SignatureData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoSelect = (url: string) => {
    setData(prev => ({ ...prev, logoUrl: url }));
  };

  const generateHTML = () => {
    // Constants from old source
    const logoHeight = "120";
    const logoWidth = "140";
    const contentColumnWith = "440";
    const displayWebsite = data.website;
    const website = data.website.startsWith('https') ? data.website : 'https://' + data.website;

    // Styles from old source
    const labelColumnStyle = "color: #00AD4F;" +
      "vertical-align:top;" +
      "font-weight:bold;" +
      "padding-right:5px;" +
      "text-align:left;" +
      "font-size:12px;";

    const fullNameStyle = "color: #00AD4F;" +
      "font-size:14px;" +
      "font-weight:bold;" +
      "padding-bottom:4px;" +
      "text-align:left;";

    const contentStyle = "color: #808284;" +
      "font-size:12px;" +
      "text-align:left;";

    const linkStyle = "color: #808284;" +
      "font-size:12px;" +
      "text-decoration:none;";

    const logoColumnStyle = "padding-left: 18px;" +
      "padding-right: 5px;" +
      "border-left: 1px solid #A9A9AA;" +
      "text-align: left;";

    const contentColumnStyle =
      "padding-right: 10px;" +
      "text-align:left;" +
      "width:" + contentColumnWith + "px;";

    const logoStyle = "height:" + logoHeight + "px;" +
      "width:" + logoWidth + "px;" +
      "max-height:" + logoHeight + "px;" +
      "max-width:" + logoWidth + "px;" +
      "border:none;";

    // Generate signature following old source structure
    let generated_signature = '';
    generated_signature += '<table cellspacing="0" cellpadding="0" border="0">';
    generated_signature += '<tr>';

    generated_signature += '<td style="' + contentColumnStyle + '" width="' + contentColumnWith + '">';
    generated_signature += '<table width="' + contentColumnWith + '" cellspacing="0" cellpadding="0" border="0">';

    // Full name and job title
    generated_signature += '<tr>';
    generated_signature += '<td colspan="2" style="' + fullNameStyle + '">' + data.name;
    if (data.title !== '' && data.title !== null) {
      generated_signature += " - " + data.title;
    }
    generated_signature += '</td>';
    generated_signature += '</tr>';

    // Mobile phones and hotline
    generated_signature += '<tr>';
    generated_signature += '<td style="' + labelColumnStyle + '">M';
    generated_signature += '</td>';
    generated_signature += '<td style="' + contentStyle + '">' + '<a  style="' + linkStyle + '" href="tel:' + data.mobilePhone1 + '">' + data.mobilePhone1 + '</a>';
    if (data.mobilePhone2 !== '' && data.mobilePhone2 !== null) {
      generated_signature += " - " + '<a  style="' + linkStyle + '" href="tel:' + data.mobilePhone2 + '">' + data.mobilePhone2 + '</a>';
    }

    if (data.hotline !== '' && data.hotline !== null) {
      generated_signature += "&nbsp;&nbsp;&nbsp;&nbsp;<span style='" + labelColumnStyle + "'>H</span> " + '<a title="HotLine" style="' + linkStyle + '" href="tel:' + data.hotline + '">' + data.hotline + '</a>';
    }

    generated_signature += '</td>';
    generated_signature += '</tr>';

    // Address
    generated_signature += '<tr>';
    generated_signature += '<td style="' + labelColumnStyle + '">A';
    generated_signature += '</td>';
    generated_signature += '<td style="' + contentStyle + '">' + data.address1 + '<br>' + data.address2;
    generated_signature += '</td>';
    generated_signature += '</tr>';

    // Skype (optional)
    if (data.skype !== '' && data.skype !== null) {
      generated_signature += '<tr>';
      generated_signature += '<td style="' + labelColumnStyle + '">S';
      generated_signature += '</td>';
      generated_signature += '<td style="' + contentStyle + '">' + data.skype;
      generated_signature += '</td>';
      generated_signature += '</tr>';
    }

    // Email support (optional)
    if (data.emailSupport !== '' && data.emailSupport !== null) {
      generated_signature += '<tr>';
      generated_signature += '<td style="' + labelColumnStyle + '">E';
      generated_signature += '</td>';
      generated_signature += '<td style="' + contentStyle + '">' + '<a title="Email hỗ trợ"  style="' + linkStyle + '" href="mailto:' + data.emailSupport + '">' + data.emailSupport + '</a>';
      generated_signature += '</td>';
      generated_signature += '</tr>';
    }

    // Website
    generated_signature += '<tr>';
    generated_signature += '<td style="' + labelColumnStyle + '">W';
    generated_signature += '</td>';
    generated_signature += '<td style="' + contentStyle + '">' + '<a style="' + linkStyle + '" href="' + website + '" >' + displayWebsite + '</a>';
    generated_signature += '</td>';
    generated_signature += '</tr>';

    generated_signature += '</table>';
    generated_signature += '</td>';

    // Logo column
    generated_signature += '<td  style="' + logoColumnStyle + '">';
    generated_signature += '<a style="display:inline-block" href="' + website + '"><img height="' + logoHeight + '" width="' + logoWidth + '" style="' + logoStyle + '" src="' + data.logoUrl + '"></a>';
    generated_signature += '</td>';

    generated_signature += '</tr>';
    generated_signature += '</table>';

    return generated_signature;
  };

  // Memoize HTML generation to prevent focus loss when typing
  const generatedHTML = useMemo(() => generateHTML(), [data]);

  const handleCopy = () => {
      navigator.clipboard.writeText(generatedHTML);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyFormatted = () => {
    try {
      // Get the preview element
      const previewDiv = document.getElementById('signature-preview');
      if (!previewDiv) {
        throw new Error('Preview element not found');
      }

      // Select the content from the preview div
      const range = document.createRange();
      range.selectNodeContents(previewDiv);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);

      // Copy to clipboard
      const success = document.execCommand('copy');
      
      // Clean up selection
      selection?.removeAllRanges();

      if (success) {
        setCopiedFormatted(true);
        setTimeout(() => setCopiedFormatted(false), 2000);
      } else {
        throw new Error('Copy command failed');
      }
    } catch (err) {
      console.error('Failed to copy formatted signature:', err);
      // Fallback to copying HTML code
      navigator.clipboard.writeText(generatedHTML);
      setCopiedFormatted(true);
      setTimeout(() => setCopiedFormatted(false), 2000);
    }
  };



  return (
    <div className="flex flex-col h-full space-y-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Mail className="w-6 h-6 text-green-500" />
            Email Signature Generator
          </h2>
          <p className="text-slate-400 text-sm">Tạo chữ ký email chuyên nghiệp cho bạn.</p>
        </div>
        <div className="flex gap-2">
           <Button onClick={() => setActiveTab('edit')} variant={activeTab === 'edit' ? 'primary' : 'secondary'} size="sm" icon={<User className="w-4 h-4"/>}>
              Chỉnh sửa
           </Button>
           <Button onClick={() => setActiveTab('preview')} variant={activeTab === 'preview' ? 'primary' : 'secondary'} size="sm" icon={<Eye className="w-4 h-4"/>}>
              Xem trước
           </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-6">
        
        {/* LEFT COLUMN: EDITOR */}
        <div className={`flex-1 overflow-y-auto pr-2 space-y-6 ${activeTab === 'edit' ? 'block' : 'hidden md:block'}`}>
          
          <InputGroup label="Thông tin cá nhân" icon={User}>
            <div className="grid grid-cols-2 gap-4">
              <TextField label="Họ và Tên" required value={data.name} onChange={(v) => handleInputChange('name', v)} />
              <TextField label="Chức vụ" required value={data.title} onChange={(v) => handleInputChange('title', v)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Logo URL <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={data.logoUrl}
                onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Chọn logo nhanh</label>
              <div className="flex flex-wrap gap-3">
                {LOGO_OPTIONS.map(logo => (
                  <label key={logo.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="logo"
                      checked={data.logoUrl === logo.url}
                      onChange={() => handleLogoSelect(logo.url)}
                      className="w-4 h-4 text-green-500 focus:ring-green-500"
                    />
                    <span className="text-sm text-slate-300">{logo.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </InputGroup>

          <InputGroup label="Thông tin liên hệ" icon={Smartphone}>
             <div className="grid grid-cols-2 gap-4">
                <TextField label="Số điện thoại 1" placeholder="+84..." required value={data.mobilePhone1} onChange={(v) => handleInputChange('mobilePhone1', v)} />
                <TextField label="Số điện thoại 2" placeholder="+84..." value={data.mobilePhone2} onChange={(v) => handleInputChange('mobilePhone2', v)} />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <TextField label="Skype" placeholder="skype_username" value={data.skype} onChange={(v) => handleInputChange('skype', v)} />
                <TextField label="Hotline" placeholder="1900..." value={data.hotline} onChange={(v) => handleInputChange('hotline', v)} />
             </div>
             <TextField label="Email hỗ trợ" placeholder="support@yourcompany.com" value={data.emailSupport} onChange={(v) => handleInputChange('emailSupport', v)} />
          </InputGroup>

          <InputGroup label="Thông tin công ty" icon={MapPin}>
             <TextField label="Địa chỉ 1" placeholder="Địa chỉ văn phòng 1" value={data.address1} onChange={(v) => handleInputChange('address1', v)} />
             <TextField label="Địa chỉ 2" placeholder="Địa chỉ văn phòng 2" value={data.address2} onChange={(v) => handleInputChange('address2', v)} />
             <TextField label="Website" placeholder="yourcompany.com" value={data.website} onChange={(v) => handleInputChange('website', v)} />
          </InputGroup>

        </div>

        {/* RIGHT COLUMN: PREVIEW */}
        <div className={`flex-1 flex flex-col gap-6 ${activeTab === 'preview' ? 'block' : 'hidden md:flex'}`}>
           <div className="bg-slate-900 rounded-xl border border-slate-800 p-1">
              <div id="signature-preview" className="bg-white rounded-lg p-8 overflow-auto min-h-[200px] flex items-center justify-center">
                 <div dangerouslySetInnerHTML={{ __html: generatedHTML }} />
              </div>
              <div className="p-3 flex justify-between items-center text-xs px-4 border-t border-slate-700">
                 <span className="text-slate-500">Xem trước trực tiếp • Cập nhật tự động</span>
                 <Button onClick={handleCopyFormatted} variant="primary" size="sm" icon={copiedFormatted ? <Check className="w-3 h-3"/> : <Copy className="w-3 h-3"/>}>
                    {copiedFormatted ? 'Đã sao chép!' : 'Copy Chữ ký'}
                 </Button>
              </div>
              <div className="px-4 pb-3">
                 <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex gap-2">
                    <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-300">
                       <strong>Hướng dẫn:</strong> Click "Copy Chữ ký" → Mở Outlook/Gmail → Paste (Ctrl+V) vào ô soạn email mới hoặc phần Signature settings. Chữ ký sẽ giữ nguyên màu sắc và định dạng.
                    </div>
                 </div>
              </div>
           </div>

           <div className="flex-1 flex flex-col bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
             <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">
                <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                   <Code className="w-4 h-4 text-slate-500" /> HTML Code
                </h3>
                <Button onClick={handleCopy} variant="primary" size="sm" icon={copied ? <Check className="w-3 h-3"/> : <Copy className="w-3 h-3"/>}>
                    {copied ? 'Đã sao chép' : 'Copy HTML'}
                </Button>
             </div>
             <div className="flex-1 relative">
                <textarea 
                  className="w-full h-full bg-slate-950 p-4 font-mono text-xs text-slate-400 focus:outline-none resize-none"
                  readOnly
                  value={generatedHTML} 
                />
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};