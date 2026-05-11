export function mapAuthErrorToArabic(message: string): string {
  const m = message.toLowerCase();

  if (m.includes('invalid login credentials')) return 'الإيميل أو كلمة المرور غير صحيحة.';
  if (m.includes('email not confirmed')) return 'من فضلك فعّل الإيميل أولًا ثم حاول مرة أخرى.';
  if (m.includes('user already registered') || m.includes('already') || m.includes('exists')) {
    return 'هذا الإيميل مسجل بالفعل. جرّب تسجيل الدخول.';
  }
  if (m.includes('rate limit') || m.includes('too many requests')) {
    return 'تم تجاوز عدد المحاولات مؤقتًا. انتظر قليلًا ثم حاول مرة أخرى.';
  }
  if (m.includes('network') || m.includes('failed to fetch')) {
    return 'مشكلة في الاتصال بالإنترنت. تأكد من الشبكة ثم حاول مرة أخرى.';
  }
  if (m.includes('oauth') || m.includes('provider')) {
    return 'حدثت مشكلة في تسجيل الدخول عبر مزود الخدمة. تأكد من إعدادات Google OAuth.';
  }
  if (m.includes('expired')) return 'انتهت صلاحية الرابط. اطلب رابطًا جديدًا.';
  if (m.includes('weak password')) return 'كلمة المرور ضعيفة. اختر كلمة مرور أقوى.';

  return 'حدث خطأ غير متوقع. حاول مرة أخرى.';
}

