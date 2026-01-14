import { readFileSync } from 'fs';
import { join } from 'path';
import { supabaseAdmin } from '../lib/supabase/server';

// This is a placeholder - actual questions_json should be created based on the Japanese questionnaire structure
const questionsJson = {
  sections: [
    {
      id: 'basic',
      title: {
        ja: '基本情報',
        zh: '基本信息',
        en: 'Basic Information',
        ko: '기본 정보',
        tl: 'Impormasyong Pangunahin',
        pt: 'Informações Básicas',
        es: 'Información Básica',
        vi: 'Thông Tin Cơ Bản',
        th: 'ข้อมูลพื้นฐาน',
        id: 'Informasi Dasar',
        km: 'ព័ត៌មានមូលដ្ឋាន',
        ne: 'आधारभूत जानकारी',
        lo: 'ຂໍ້ມູນພື້ນຖານ',
        de: 'Grundinformationen',
        ru: 'Основная информация',
        fr: 'Informations de Base',
        fa: 'اطلاعات پایه',
        ar: 'المعلومات الأساسية',
        hr: 'Osnovne Informacije',
        ta: 'அடிப்படை தகவல்',
        si: 'මූලික තොරතුරු',
        uk: 'Основна інформація',
        my: 'အခြေခံအချက်အလက်',
        mn: 'Үндсэн Мэдээлэл',
      },
      fields: [
        {
          id: 'name',
          type: 'text',
          label: {
            ja: '氏名',
            zh: '姓名',
            en: 'Name',
            ko: '성명',
            tl: 'Pangalan',
            pt: 'Nome',
            es: 'Nombre',
            vi: 'Họ tên',
            th: 'ชื่อ',
            id: 'Nama',
            km: 'ឈ្មោះ',
            ne: 'नाम',
            lo: 'ຊື່',
            de: 'Name',
            ru: 'Имя',
            fr: 'Nom',
            fa: 'نام',
            ar: 'الاسم',
            hr: 'Ime',
            ta: 'பெயர்',
            si: 'නම',
            uk: "Ім'я",
            my: 'အမည်',
            mn: 'Нэр',
          },
          required: true,
          placeholder: {
            ja: '名前',
            zh: '姓名',
            en: 'Enter your name',
            ko: '이름',
            tl: 'Ilagay ang inyong pangalan',
            pt: 'Digite seu nome',
            es: 'Ingrese su nombre',
            vi: 'Nhập tên của bạn',
            th: 'กรอกชื่อของคุณ',
            id: 'Masukkan nama Anda',
            km: 'បញ្ចូលឈ្មោះរបស់អ្នក',
            ne: 'आफ्नो नाम प्रविष्ट गर्नुहोस्',
            lo: 'ໃສ່ຊື່ຂອງທ່ານ',
            de: 'Geben Sie Ihren Namen ein',
            ru: 'Введите ваше имя',
            fr: 'Entrez votre nom',
            fa: 'نام خود را وارد کنید',
            ar: 'أدخل اسمك',
            hr: 'Unesite svoje ime',
            ta: 'உங்கள் பெயரை உள்ளிடவும்',
            si: 'ඔබේ නම ඇතුළත් කරන්න',
            uk: 'Введіть ваше ім\'я',
            my: 'သင့်အမည်ကို ထည့်သွင်းပါ',
            mn: 'Нэрээ оруулна уу',
          },
        },
        {
          id: 'sex',
          type: 'radio',
          label: {
            ja: '性別',
            zh: '性别',
            en: 'Gender',
            ko: '성별',
            tl: 'Kasarian',
            pt: 'Sexo',
            es: 'Género',
            vi: 'Giới tính',
            th: 'เพศ',
            id: 'Jenis Kelamin',
            km: 'ភេទ',
            ne: 'लिङ्ग',
            lo: 'ເພດ',
            de: 'Geschlecht',
            ru: 'Пол',
            fr: 'Sexe',
            fa: 'جنسیت',
            ar: 'الجنس',
            hr: 'Spol',
            ta: 'பாலினம்',
            si: 'ලිංගය',
            uk: 'Стать',
            my: 'လိင်',
            mn: 'Хүйс',
          },
          required: true,
          options: [
            {
              value: 'male',
              label: {
                ja: '男',
                zh: '男',
                en: 'Male',
                ko: '남',
                tl: 'Lalaki',
                pt: 'Masculino',
                es: 'Masculino',
                vi: 'Nam',
                th: 'ชาย',
                id: 'Laki-laki',
                km: 'ប្រុស',
                ne: 'पुरुष',
                lo: 'ຊາຍ',
                de: 'Männlich',
                ru: 'Мужской',
                fr: 'Homme',
                fa: 'مرد',
                ar: 'ذكر',
                hr: 'Muški',
                ta: 'ஆண்',
                si: 'පිරිමි',
                uk: 'Чоловік',
                my: 'ကျား',
                mn: 'Эр',
              },
            },
            {
              value: 'female',
              label: {
                ja: '女',
                zh: '女',
                en: 'Female',
                ko: '여',
                tl: 'Babae',
                pt: 'Feminino',
                es: 'Femenino',
                vi: 'Nữ',
                th: 'หญิง',
                id: 'Perempuan',
                km: 'ស្រី',
                ne: 'महिला',
                lo: 'ຍິງ',
                de: 'Weiblich',
                ru: 'Женский',
                fr: 'Femme',
                fa: 'زن',
                ar: 'أنثى',
                hr: 'Ženski',
                ta: 'பெண்',
                si: 'ගැහැණු',
                uk: 'Жінка',
                my: 'မ',
                mn: 'Эм',
              },
            },
          ],
        },
      ],
    },
  ],
};

async function seedStandardTemplate() {
  const pdfHtml = readFileSync(join(process.cwd(), 'lib/pdf/template.html'), 'utf-8');

  const { data, error } = await supabaseAdmin
    .from('form_templates')
    .upsert({
      template_name: '標準テンプレート',
      questions_json: questionsJson,
      pdf_html: pdfHtml,
    }, {
      onConflict: 'template_name',
    })
    .select()
    .single();

  if (error) {
    console.error('Error seeding standard template:', error);
  } else {
    console.log('Standard template seeded successfully:', data.id);
  }
}

// This script should be run manually or via a migration
// seedStandardTemplate();
