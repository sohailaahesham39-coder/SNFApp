import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function Step1() {
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('');
  const valid = age && height && weight && gender;

  return (
    <View style={s.container}>
      <LinearGradient colors={['#050505','#0a0f08']} style={StyleSheet.absoluteFill} />
      <View style={s.prog}>{[1,2,3,4].map(i=><View key={i} style={[s.step,i===1&&s.on]}/>)}</View>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.num}>Step 1 of 4</Text>
        <Text style={s.title}>About you 📏</Text>
        <Text style={s.sub}>We'll calculate your personalized plan</Text>
        <View style={s.gRow}>
          {(['male','female']).map(g=>(
            <TouchableOpacity key={g} style={[s.gBtn,gender===g&&s.gOn]} onPress={()=>setGender(g)}>
              <Text style={s.gIcon}>{g==='male'?'👨':'👩'}</Text>
              <Text style={[s.gTxt,gender===g&&s.gTxtOn]}>{g==='male'?'Male':'Female'}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {[{lbl:'Age (years)',val:age,set:setAge,ph:'25',unit:'yrs'},{lbl:'Height (cm)',val:height,set:setHeight,ph:'165',unit:'cm'},{lbl:'Weight (kg)',val:weight,set:setWeight,ph:'70',unit:'kg'}].map(f=>(
          <View key={f.lbl}>
            <Text style={s.lbl}>{f.lbl}</Text>
            <View style={s.iRow}>
              <TextInput style={s.input} value={f.val} onChangeText={f.set} placeholder={f.ph} placeholderTextColor="#444" keyboardType="numeric"/>
              <Text style={s.unit}>{f.unit}</Text>
            </View>
          </View>
        ))}
        <TouchableOpacity style={[s.btn,!valid&&s.off]} disabled={!valid}
          onPress={()=>router.push({pathname:'/onboarding/step2',params:{age,height,weight,gender}})}>
          <Text style={s.btnT}>Next →</Text>
        </TouchableOpacity>
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
  gRow:{flexDirection:'row',gap:12,marginBottom:20},
  gBtn:{flex:1,alignItems:'center',padding:16,borderRadius:16,borderWidth:1,borderColor:'rgba(255,255,255,0.08)',backgroundColor:'rgba(255,255,255,0.03)'},
  gOn:{borderColor:'#E8FF4D',backgroundColor:'rgba(232,255,77,0.08)'},
  gIcon:{fontSize:28,marginBottom:6},
  gTxt:{fontSize:14,color:'#888',fontWeight:'600'},
  gTxtOn:{color:'#E8FF4D'},
  lbl:{fontSize:13,fontWeight:'600',color:'#ccc',marginBottom:8},
  iRow:{flexDirection:'row',alignItems:'center',gap:10,marginBottom:16},
  input:{flex:1,backgroundColor:'#1a1a1a',borderWidth:1,borderColor:'rgba(255,255,255,0.08)',borderRadius:12,padding:14,color:'#fff',fontSize:16},
  unit:{fontSize:13,color:'#888',width:30},
  btn:{backgroundColor:'#E8FF4D',borderRadius:16,paddingVertical:16,alignItems:'center',marginTop:8},
  off:{opacity:0.4},
  btnT:{fontSize:16,fontWeight:'800',color:'#000'},
});