import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const GOALS = [
  {id:'Weight Loss',icon:'🔥',title:'Lose Weight',desc:'Burn fat, feel lighter'},
  {id:'Muscle Gain',icon:'💪',title:'Build Muscle',desc:'Gain strength and mass'},
  {id:'Maintain',icon:'⚖️',title:'Stay Healthy',desc:'Maintain current weight'},
];

export default function Step2() {
  const params = useLocalSearchParams();
  const [goal, setGoal] = useState('');

  return (
    <View style={s.container}>
      <LinearGradient colors={['#050505','#0a0f08']} style={StyleSheet.absoluteFill}/>
      <View style={s.prog}>{[1,2,3,4].map(i=><View key={i} style={[s.step,i<=2&&s.on]}/>)}</View>
      <View style={s.content}>
        <Text style={s.num}>Step 2 of 4</Text>
        <Text style={s.title}>Your goal 🎯</Text>
        <Text style={s.sub}>We'll tailor your plan</Text>
        <View style={s.goals}>
          {GOALS.map(g=>(
            <TouchableOpacity key={g.id} style={[s.card,goal===g.id&&s.cardOn]} onPress={()=>setGoal(g.id)}>
              <Text style={s.gIcon}>{g.icon}</Text>
              <View style={s.gInfo}>
                <Text style={[s.gTitle,goal===g.id&&s.gTitleOn]}>{g.title}</Text>
                <Text style={s.gDesc}>{g.desc}</Text>
              </View>
              <View style={[s.radio,goal===g.id&&s.radioOn]}>{goal===g.id&&<View style={s.dot}/>}</View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={s.btns}>
          <TouchableOpacity style={s.back} onPress={()=>router.back()}><Text style={s.backT}>← Back</Text></TouchableOpacity>
          <TouchableOpacity style={[s.next,!goal&&s.off]} disabled={!goal}
            onPress={()=>router.push({pathname:'/onboarding/step3',params:{...params,goal}})}>
            <Text style={s.nextT}>Next →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:'#080808'},
  prog:{flexDirection:'row',gap:6,padding:24,paddingTop:60,paddingBottom:0},
  step:{flex:1,height:3,borderRadius:3,backgroundColor:'rgba(255,255,255,0.1)'},
  on:{backgroundColor:'#E8FF4D'},
  content:{flex:1,padding:24,paddingTop:16},
  num:{fontSize:12,color:'#555',marginBottom:8},
  title:{fontSize:24,fontWeight:'900',color:'#fff',marginBottom:8},
  sub:{fontSize:14,color:'#888',marginBottom:28},
  goals:{gap:12,flex:1},
  card:{flexDirection:'row',alignItems:'center',gap:16,padding:20,borderRadius:20,borderWidth:1,borderColor:'rgba(255,255,255,0.08)',backgroundColor:'rgba(255,255,255,0.03)'},
  cardOn:{borderColor:'#E8FF4D',backgroundColor:'rgba(232,255,77,0.06)'},
  gIcon:{fontSize:32},
  gInfo:{flex:1},
  gTitle:{fontSize:16,fontWeight:'700',color:'#ccc',marginBottom:2},
  gTitleOn:{color:'#E8FF4D'},
  gDesc:{fontSize:13,color:'#555'},
  radio:{width:22,height:22,borderRadius:11,borderWidth:2,borderColor:'#444',alignItems:'center',justifyContent:'center'},
  radioOn:{borderColor:'#E8FF4D'},
  dot:{width:10,height:10,borderRadius:5,backgroundColor:'#E8FF4D'},
  btns:{flexDirection:'row',gap:12,marginTop:24},
  back:{flex:1,borderRadius:16,paddingVertical:16,alignItems:'center',borderWidth:1,borderColor:'rgba(255,255,255,0.1)'},
  backT:{fontSize:15,color:'#888',fontWeight:'600'},
  next:{flex:2,backgroundColor:'#E8FF4D',borderRadius:16,paddingVertical:16,alignItems:'center'},
  off:{opacity:0.4},
  nextT:{fontSize:16,fontWeight:'800',color:'#000'},
});