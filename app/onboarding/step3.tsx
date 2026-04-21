import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const ACTS = [
  {id:'sedentary',icon:'🛋️',title:'Sedentary',desc:'Little or no exercise',mult:'×1.2'},
  {id:'light',icon:'🚶',title:'Lightly Active',desc:'1-3 days/week',mult:'×1.375'},
  {id:'moderate',icon:'🏃',title:'Moderately Active',desc:'3-5 days/week',mult:'×1.55'},
  {id:'active',icon:'⚡',title:'Very Active',desc:'6-7 days/week',mult:'×1.725'},
  {id:'very_active',icon:'🔥',title:'Extremely Active',desc:'Athlete / physical job',mult:'×1.9'},
];

export default function Step3() {
  const params = useLocalSearchParams();
  const [act, setAct] = useState('');

  return (
    <View style={s.container}>
      <LinearGradient colors={['#050505','#0a0f08']} style={StyleSheet.absoluteFill}/>
      <View style={s.prog}>{[1,2,3,4].map(i=><View key={i} style={[s.step,i<=3&&s.on]}/>)}</View>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.num}>Step 3 of 4</Text>
        <Text style={s.title}>Activity level 🏃</Text>
        <Text style={s.sub}>How active are you typically?</Text>
        <View style={s.list}>
          {ACTS.map(a=>(
            <TouchableOpacity key={a.id} style={[s.card,act===a.id&&s.cardOn]} onPress={()=>setAct(a.id)}>
              <Text style={s.icon}>{a.icon}</Text>
              <View style={s.info}><Text style={[s.aT,act===a.id&&s.aTOn]}>{a.title}</Text><Text style={s.aD}>{a.desc}</Text></View>
              <Text style={[s.mult,act===a.id&&s.multOn]}>{a.mult}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={s.btns}>
          <TouchableOpacity style={s.back} onPress={()=>router.back()}><Text style={s.backT}>← Back</Text></TouchableOpacity>
          <TouchableOpacity style={[s.next,!act&&s.off]} disabled={!act}
            onPress={()=>router.push({pathname:'/onboarding/step4',params:{...params,activity:act}})}>
            <Text style={s.nextT}>Next →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:'#080808'},
  prog:{flexDirection:'row',gap:6,padding:24,paddingTop:60,paddingBottom:0},
  step:{flex:1,height:3,borderRadius:3,backgroundColor:'rgba(255,255,255,0.1)'},
  on:{backgroundColor:'#E8FF4D'},
  scroll:{padding:24,paddingTop:16},
  num:{fontSize:12,color:'#555',marginBottom:8},
  title:{fontSize:24,fontWeight:'900',color:'#fff',marginBottom:8},
  sub:{fontSize:14,color:'#888',marginBottom:24},
  list:{gap:10,marginBottom:28},
  card:{flexDirection:'row',alignItems:'center',gap:14,padding:16,borderRadius:16,borderWidth:1,borderColor:'rgba(255,255,255,0.08)',backgroundColor:'rgba(255,255,255,0.03)'},
  cardOn:{borderColor:'#E8FF4D',backgroundColor:'rgba(232,255,77,0.06)'},
  icon:{fontSize:24,width:32,textAlign:'center'},
  info:{flex:1},
  aT:{fontSize:14,fontWeight:'700',color:'#ccc',marginBottom:2},
  aTOn:{color:'#E8FF4D'},
  aD:{fontSize:12,color:'#555'},
  mult:{fontSize:12,color:'#444',fontWeight:'600'},
  multOn:{color:'#E8FF4D'},
  btns:{flexDirection:'row',gap:12},
  back:{flex:1,borderRadius:16,paddingVertical:16,alignItems:'center',borderWidth:1,borderColor:'rgba(255,255,255,0.1)'},
  backT:{fontSize:15,color:'#888',fontWeight:'600'},
  next:{flex:2,backgroundColor:'#E8FF4D',borderRadius:16,paddingVertical:16,alignItems:'center'},
  off:{opacity:0.4},
  nextT:{fontSize:16,fontWeight:'800',color:'#000'},
});